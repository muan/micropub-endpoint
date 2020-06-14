# Micropub endpoint

Used by [`muan/micropub-content`](https://github.com/muan/micropub-content).

Create your own micropub endpoint and Jekyll site in seconds!

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Jekyll site

1. Fork [`muan/micropub-content`](https://github.com/muan/micropub-content).
2. Edit `_config.yml` with your info.

And you're done! The Jekyll site might take a minute to build. But then you can head to [https://muan-micropub-client.glitch.me/](https://muan-micropub-client.glitch.me/) and log in with your Jekyll site URL to create your first post. There is even a `feed.rss` that you can use for [micro.blog](https://micro.blog/).

## Flow explained

To publish a post through the Mircopub spec and this specific implementation, it requires the following:

1. `GitHub` as the authentication provider.
2. `GitHub` and its API for interacting with the repository for your blog content.
3. `Micropub endpoint`[[template]](https://github.com/muan/micropub-endpoint) that handles sending a request to GitHub.
4. `Micropub client`[[template]](https://github.com/muan/micropub-client) that handles authenticating and sending a request to the endpoint. There area many other micropub clients that follow the same spec and therefore are interchangeable. For example, [Quill](https://quill.p3k.io/).
5. `IndieAuth` as the mechanism for authenticating.
6. `Micropub content`[[template]](https://github.com/muan/micropub-content), in this case your GitHub Pages site.

Out of these 6 items, you should create the `Mircopub endpoint`, so that you can customize where the post is created and how it is created, and `Mircopub content`, so that you can customize how the website looks.

Flow:

1. User (you) visits `Micropub client` and log in with your website.
  - In this example, it should be the `Micropub content` Pages site. But it can be a different website as long as it has [these lines](https://github.com/muan/micropub-content/blob/f558b7124c6de6d3da2b1a83b892590ed6853691/_layouts/default.html#L9-L10).
2. `Micropub client` sends a GET request to your website to retrieve your preferred auth endpoints.
3. `Micropub client` redirects you to that endpoint, in this case `IndieAuth for GitHub`, which is a service hosted on Heroku whose sole purpose is to talk to GitHub API and create an access token.
4. Once an access token is obtained, `Micropub client` presents you with text areas for you to create your blog post with.
5. When you submit the post content, `Micropub client` sends the payload to `Micropub endpoint`.
6. `Micropub endpoint` uses sends a request to GitHub with this payload, and create a file in the repository you set in `app.json`.
7. GitHub receives the request and creates a file.
8. GitHub Pages service rebuild your Jekyll site.
9. Your new post is live.
