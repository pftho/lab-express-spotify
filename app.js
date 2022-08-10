require("dotenv").config();

const express = require("express");
const hbs = require("hbs");

// require spotify-web-api-node package here:
const SpotifyWebApi = require("spotify-web-api-node");

const app = express();

app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

// setting the spotify-api goes here:

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch((error) =>
    console.log("Something went wrong when retrieving an access token", error)
  );

// Our routes go here:

//home page route
app.get("/", (req, res) => {
  res.render("index");
});

//artist search route -> result of user typing name of artist
// we use query with "name" attribute from the input tag in the index page to find information we need from API
app.get("/artist-search", (req, res) => {
  const artistName = req.query.artistName;
  spotifyApi
    .searchArtists(artistName)
    .then((data) => {
      //    console.log("The received data from the API: ", data.body);
      const {
        artists: { items },
      } = data.body;
      // console.log(items);
      res.render("artist-search-results", { items });
    })
    .catch((err) =>
      console.log("The error while searching artists occurred: ", err)
    );
});

//album route -> from the album page we are able to get the artist id as param in the url
// we use this artistId to get information on the album
app.get("/albums/:artistId", (req, res) => {
  const { artistId } = req.params;
  console.log(artistId);
  spotifyApi
    .getArtistAlbums(artistId)
    .then((data) => {
      console.log("Artist albums", data.body);
      const { items } = data.body;
      res.render("albums", { items });
    })
    .catch((err) => console.error(err));
});

//tracks route -> from the album page we are able to get album id as param
// we use the album id to get the tracks, we decide what limit and offset we want per page
app.get("/tracks/:albumId", (req, res) => {
  const { albumId } = req.params;
  spotifyApi
    .getAlbumTracks(albumId, { limit: 50, offset: 0 })
    .then((data) => {
      console.log("Album tracks", data.body);
      const { items } = data.body;
      res.render("tracks", { items });
    })
    .catch((err) => console.error(err));
});

//we connect server to port
app.listen(3000, () =>
  console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊")
);
