const express = require("express");
const app = express();
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
app.use(express.json());
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running...");
    });
  } catch (e) {
    console.log(`Db Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
const movieChange = (obj) => {
  return {
    movieId: obj.movie_id,
    directorId: obj.director_id,
    movieName: obj.movie_name,
    leadActor: obj.lead_actor,
  };
};
const movieOne = (obj) => {
  return {
    movieName: obj.movie_name,
  };
};
const directorOne = (obj) => {
  return {
    directorId: obj.director_id,
    directorName: obj.director_name,
  };
};
//App1
app.get("/movies/", async (request, response) => {
  const query = `
SELECT movie_name
FROM movie;
`;
  const dbResponse = await db.all(query);
  response.send(dbResponse.map((eachMovie) => movieOne(eachMovie)));
});
//App2
app.post("/movies/", async (request, response) => {
  const details = request.body;
  const { directorId, movieName, leadActor } = details;
  const query = `
INSERT INTO movie(director_id,movie_name,lead_actor)
VALUES (${directorId},'${movieName}','${leadActor}');
`;
  await db.run(query);
  response.send("Movie Successfully Added");
});
//App3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const query = `
SELECT *
FROM movie
WHERE movie_id= ${movieId};
`;
  const dbResponse = await db.get(query);
  response.send(movieChange(dbResponse));
});
//App4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const details = request.body;
  const { directorId, movieName, leadActor } = details;
  const query = `
UPDATE movie
SET director_id= ${directorId},movie_name= '${movieName}',lead_actor= '${leadActor}'
WHERE movie_id= ${movieId};
`;
  await db.run(query);
  response.send("Movie Details Updated");
});
//App5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const query = `
DELETE FROM movie
WHERE movie_id= ${movieId};
`;
  await db.run(query);
  response.send("Movie Removed");
});
//App6
app.get("/directors/", async (request, response) => {
  const query = `
SELECT *
FROM director;
`;
  const dbResponse = await db.all(query);
  response.send(dbResponse.map((eachDirector) => directorOne(eachDirector)));
});
//App7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const query = `
SELECT movie_name
FROM movie 
WHERE director_id= ${directorId};
`;
  const dbResponse = await db.all(query);
  response.send(dbResponse.map((eachMovie) => movieOne(eachMovie)));
});
module.exports = app;
