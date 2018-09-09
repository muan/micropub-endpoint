# Micropub endpoint

Used by [`muan/micropub-content`](https://github.com/muan/micropub-content).

Create your own micropub endpoint and Jekyll site in seconds!

## Endpoint

1. Create a `hello-express` project on [Glitch](https://glitch.com/).
2. Import this repository.
3. Add the following to `.env` (modified with the Jekyll site repository and URL information):

   ```
   REPO='muan/micropub-content'
   SITEURL='https://muan.github.io/micropub-content'
   ```


## Jekyll site

1. Fork [`muan/micropub-content`](https://github.com/muan/micropub-content).
2. Edit `_config.yml` with your info.

And you're done! The Jekyll site might take a minute to build. But then you can head to [https://muan-micropub-client.glitch.me/](https://muan-micropub-client.glitch.me/) and log in with your Jekyll site URL to create your first post. There is even a `feed.rss` that you can use for [micro.blog](https://micro.blog/). 
