const fs = require('fs')
const request = require('request')
const repo = process.env.REPO

// Returns
// - Error: {error: {code: number, body: {error: string, error_description: string}} or
// - Success: {code: number, location?: string}
module.exports = async function(token, body, file) {
  GitHub.accessToken = token
  
  if (body.action === 'delete') {
    return await deleteEntry(body.url)
  } else if (body.action === 'update') {
    return await updateEntry(body.url, body.replace.content[0])
  } else if (Object.keys(body).length === 0 && file) {
    return await GitHub.uploadFile((Math.random()*10000000).toFixed(0), file)
  } else if (body.h === 'entry') {
    return await createEntry(body, file)
  } else {
    return Promise.resolve({
      error: {
        code: 501, 
        body: {
          error: 501, 
          error_description: `Who knows what's going on? ¯\_(ツ)_/¯`
        }
      }
    })
  }
}

async function createEntry(body, photo) {
  let result
  
  const datetime = new Date().toISOString().split(/:\d\d\./)[0]
  const date = datetime.split('T')[0]
  const title = body.name || datetime
  const filename = datetime.replace(/:|T/g, '-')
  const filepath = `_posts/${date}-${filename}.md`
  if (photo) {
    const uploadResult = await GitHub.uploadFile(filename, photo)
    if (uploadResult.location) {
      body.content = `![](${uploadResult.location})\n\n${body.content}`
    } else {
      return Promise.resolve(uploadResult.error)
    }
  }
  const content = `---\ndate: ${datetime}\ntitle: ${title}\nlayout: default\n---\n\n${body.content}`
  const createResult = await GitHub.createFile(filepath, filename, content)
  if (createResult.location) {
    result = createResult
  } else {
    result = createResult.error
  }
  return result
}

async function updateEntry(url, content) {
  const updateResult = await GitHub.updateFile(pathFromLocation(url), content)
  return updateResult.ok ? {code: 201, location: url} : updateResult.error
}

async function deleteEntry(url) {
  const deleteResult = await GitHub.deleteFile(pathFromLocation(url))
  return deleteResult.ok ? {code: 204} : deleteResult.error
}

function pathFromLocation(url) {
  const filename = url.split('/')[url.split('/').length - 1]
  return `_posts/${filename.replace(/-\d\d-\d\d$/, '')}-${filename}.md`
  
}

const GitHub = {
  accessToken: null,
  requestWithOptions: function(args, cb) {
    const options = {
      url: `https://api.github.com/repos/${repo}/contents/`,
      method: 'put',
      json: true,
      headers: {
        Authorization: `token ${GitHub.accessToken}`,
        'User-Agent': 'micropub-endpoint'
      },
      body: {
        path: null,
        message: '🆕 Create an entry via micropub',
        branch: 'gh-pages',
        content: null
      }
    }
    if (args.path) {
      options.url += args.path
      options.body.path = args.path
    }
    if (args.method) {
      options.method = args.method
    }
    if (args.content) {
      options.body.content = args.content
    }
    if (args.message) {
      options.body.message = args.message
    }
    if (args.sha) {
      options.body.sha = args.sha
    }
    
    request(options, cb)
  },
  
  errorResponse(res, body) {
    return {error: {code: res.statusCode, body: {error: res.statusCode, error_description: body.message}}}
  },
  
  // https://developer.github.com/v3/repos/contents/#create-a-file
  createFile: async function(path, filename, content) {
    return await new Promise(resolve => {
      GitHub.requestWithOptions({
        path, 
        content: Buffer.from(content).toString('base64')
      }, function (err, res, body) {
        console.log('create', err)
        if (res && res.statusCode === 201) {
          resolve({code: 201, location: `${process.env.SITEURL}/posts/${filename}`})
        } else {
          resolve(GitHub.errorResponse(res, body))
        }
      })
    })
  },

  // https://developer.github.com/v3/repos/contents/#create-a-file
  uploadFile: async function(filename, photo) {
    return await new Promise(resolve => {
      filename = `${filename}-${photo.filename}`
      GitHub.requestWithOptions({
        path: `assets/${filename}`, 
        message: '🖼 Upload a file via micropub',
        content: fs.readFileSync(photo.file).toString('base64')
      }, function (err, res, body) {
        console.log('upload', err)
        if (res && res.statusCode === 201) {
          resolve({code: 201, location: `${process.env.SITEURL}/assets/${filename}`})
        } else {
          resolve(GitHub.errorResponse(res, body))
        }
      })
    })
  },

  // https://developer.github.com/v3/repos/contents/#get-contents
  getFile: async function(path) {
    return await new Promise(resolve => {
      GitHub.requestWithOptions({
        path,
        method: 'get'
      }, function(err, res, body) {
        console.log('get', err)
        if (res && res.statusCode === 200) {
          resolve({content: Buffer.from(body.content, 'base64').toString('utf8'), sha: body.sha})
        } else {
          resolve(GitHub.errorResponse(res, body))
        }
      })
    })
  },
  

  // https://developer.github.com/v3/repos/contents/#update-a-file
  updateFile: async function(path, content) {
    const getResult = await GitHub.getFile(path)
    return await new Promise(resolve => {
      if (getResult.error) resolve(getResult.error)
      content = ['---', getResult.content.split('---')[1], '---\n\n', content].join('')
      GitHub.requestWithOptions({
        path,
        content: Buffer.from(content).toString('base64'),
        sha: getResult.sha,
        message: '📝 Update an entry via micropub'
      }, function(err, res, body) {
        console.log('update', err)
        if (!err && res && res.statusCode === 200) {
          resolve({code: 200, ok: true})
        } else {
          resolve(GitHub.errorResponse(res, body))
        }
      })
    })
  },
  
  // https://developer.github.com/v3/repos/contents/#delete-a-file
  deleteFile: async function(path) {
    const getResult = await GitHub.getFile(path)
    return await new Promise(resolve => {
      if (getResult.error) resolve(getResult.error)
      
      GitHub.requestWithOptions({
        path,
        sha: getResult.sha,
        method: 'delete',
        message: '♻️ Delete an entry via micropub'
      }, function(err, res, body) {
        console.log('delete', err)
        if (!err && res && res.statusCode === 200) {
          resolve({code: 204, ok: true})
        } else {
          resolve(GitHub.errorResponse(res, body))
        }
      })
    })
  }
}