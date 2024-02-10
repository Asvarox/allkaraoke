# Pull request deployment
Every pull request is being deployed to a separate folder on AllKaraoke.party on push. There are few quirks around it

- The songs are not being deployed to the folder. The app will always request songs from root folder
  - This is made on purpose as songs take a lot of space (>20MB). If it proves to be problematic, it can be changed
     easily - `SongService` would need to take into account BASE_URL.
- Each deploy to `production` removes all previous PR deployments

The link to the deployed version is `https://allkaraoke.party/prs/{pr-number}/`.