const Discord = require('discord.js');
const auth = require("./auth.json");
const client = new Discord.Client();
const axios = require("axios");
const fs = require('fs');

let actors_file_sorted = [];
let directors_file_sorted = [];
let cast_file, movie_file;
cast_file = require("./cast.json");
movie_file = require("./movies.json");
sortcast();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

});

let channel;

client.on('message', msg => {
    if (msg.content.startsWith("!")) {
        let action = msg.content.split(" ")[0].substring(1);
        channel = msg.channel;
        switch (action) {
            case "list":
                displaymovies(channel);
                break;
            case "update":
                updatepinnedmessage(channel);
                break;
            case "add":
                addToDatabase(msg.content);
                updatepinnedmessage(channel);
                break;
            case "segment":
                addsegment(msg.content, channel);
                break;
            case "cast":
                displayactors(msg.content, channel);
                break;
            case "directors":
                displaydirectors(msg.content, channel);
                break;
            case "weristdran": break;
            case "info":
                displaydetails(msg.content, channel);
                break;
            default:
                channel.send("Command not recognized\r\n\r\nAvailable:\r\n!list - view movie list\r\nupdate - update pinned movie list (same as list but less clutter)\r\n!add [MOVIE] by [USER] - add a new movie to the database\r\n!segment - add a new segment to the movie list (Week 1, Week 2, Pre-Pipeline, etc. ) \r\n!cast - view actors and their appearances on the pipeline, use !cast n to display n actors, standard 10\r\n!directors - directors and their appearances on the pipeline\r\n!info [name] - get info on a specific actor/directors ppearance on the Pipeline\r\n!weristdran - whose day is it (not implemented)");
                break;
        }
    }
});

function sortcast() {
    let cast = cast_file.actors;
    for (actorname in cast) {
        actors_file_sorted.push([actorname, cast[actorname]]);
    }
    actors_file_sorted.sort((a, b) => b[1].occurrences - a[1].occurrences);

    cast = cast_file.directors;
    for (directorname in cast) {
        directors_file_sorted.push([directorname, cast[directorname]]);
    }
    directors_file_sorted.sort((a, b) => b[1].occurrences - a[1].occurrences);
}

function displaydetails(message, channel) {
    let castmember = message.substring(message.indexOf(" ") + 1);
    let type = "";
    if (cast_file.actors.hasOwnProperty(castmember)) {
        type = "actors";
    }
    else if (cast_file.directors.hasOwnProperty(castmember)) {
        type = "directors";
    }
    else {
        channel.send("cast member not found");
        return;
    }
    let response = "";
    response = response.concat(`**${castmember}**, ${cast_file[type][castmember].occurrences} appearances: \r\n\`\`\``);
    for (movie of cast_file[type][castmember].movies) {
        response = response.concat(`${movie}\r\n`);
    }
    response = response.concat("```");
    channel.send(response);
}

function addsegment(message, channel) {
    let segment_title = message.substring(message.indexOf(" ") + 1);
    if (movie_file.hasOwnProperty(segment_title)) {
        channel.send("segment already exists");
        return;
    }
    movie_file[segment_title] = {};
    channel.send("Segment added");
}

function displayactors(message, channel) {
    let max_display = 10;
    let regex = new RegExp(/ [0-9]/g);
    if (regex.test(message)) {
        max_display = parseInt(message.substring(message.indexOf(" ") + 1));
    }
    let response = "--------------------------------\r\n\r\n";

    if (max_display > actors_file_sorted.length) {
        max_display = actors_file_sorted.length;
    }
    for (let i = 0; i < max_display; i++) {
        response = response.concat(`\`${actors_file_sorted[i][1].occurrences}\` ${actors_file_sorted[i][0]}\r\n`);
    }
    response = response.concat("\r\n--------------------------------");
    try {
        channel.send(response);
    } catch (err) {
        channel.send("response too long, max 2000 characters");
    }
}

function displaydirectors(message, channel) {
    let max_display = 10;
    let regex = new RegExp(/ [0-9]/g);
    if (regex.test(message)) {
        max_display = parseInt(message.substring(message.indexOf(" ") + 1));
    }
    let response = "--------------------------------\r\n\r\n";

    if (max_display > directors_file_sorted.length) {
        max_display = directors_file_sorted.length;
    }
    for (let i = 0; i < max_display; i++) {
        response = response.concat(`\`${directors_file_sorted[i][1].occurrences}\` ${directors_file_sorted[i][0]}\r\n`);
    }
    response = response.concat("\r\n--------------------------------");
    try {
        channel.send(response);
    } catch (err) {
        channel.send("response too long, max 2000 characters");
    }
}

function displaymovies(channel) {
    return new Promise((resolve, reject) => {
        let response = "";
        let segments = Object.keys(movie_file);
        //for each segment
        for (let i = 0; i < segments.length; i++) {
            response = response.concat(`**${segments[i]}:**`);
            let sub_movies = movie_file[segments[i]];
            let sm_length = Object.keys(sub_movies).length;

            for (let z = 0; z < sm_length; z++) {
                response = response.concat(`\r\n${z + 1}. ${sub_movies[z].title} (${sub_movies[z].pipemaster})`);
            }

            response = response.concat("\r\n\r\n");
        }

        //respond with string
        channel.send(response);
        resolve();
    });
}

function updatepinnedmessage(channel) {
    return new Promise((resolve, reject) => {
        channel.messages.fetchPinned()
            .then(messages => {
                let pinnedMessages = messages.filter(m => m.author.id === client.user.id);

                let message = pinnedMessages.values().next().value;

                let response = "";
                let movies = require("./movies.json");
                let segments = Object.keys(movies);
                //for each segment
                for (let i = 0; i < segments.length; i++) {
                    response = response.concat(`**${segments[i]}:**`);
                    let sub_movies = movies[segments[i]];
                    let sm_length = Object.keys(sub_movies).length;

                    for (let z = 0; z < sm_length; z++) {
                        response = response.concat(`\r\n${z + 1}. ${sub_movies[z].title} (${sub_movies[z].pipemaster})`);
                    }

                    response = response.concat("\r\n\r\n");
                }

                //respond with string
                message.edit(response)
                    .then(resolve())
                    .catch(console.error);
            })
            .catch(console.error);
    });
}

function addToDatabase(message) {
    return new Promise((resolve, reject) => {
        parseadd(message).then(res => {
            let movie_title = "";
            let cast;
            let directors = [];
            //get movie id
            axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${auth.key}&language=en-US&query=${encodeURI(res[0])}&page=1&include_adult=false`).then((network) => {
                if (network.status === 200) {
                    //ask if movie is correct
                    channel.send(`*${network.data.results[0].overview}*`);
                    //return movie id
                    movie_title = network.data.results[0].title;
                    return network.data.results[0].id;
                }
            }).then(
                //get cast
                (movie_id) => {
                    return axios.get(`https://api.themoviedb.org/3/movie/${movie_id}/credits?api_key=${auth.key}`).then((network) => {
                        cast = network.data.cast;
                        return network.data.crew;
                    })
                }
            ).then((crew) => {
                //get director
                let director_json = crew.filter(data => data.job === "Director");
                for (let dir of director_json) {
                    directors.push(dir.name);
                    return;
                }
            }).then(() => {
                //add to file
                if (movie_file[Object.keys(movie_file).pop()].hasOwnProperty("0")) {
                    movie_file[Object.keys(movie_file).pop()][(parseInt(Object.keys(movie_file[Object.keys(movie_file).pop()]).pop()) + 1).toString()] = { title: movie_title, pipemaster: res[1] };
                } else {
                    movie_file[Object.keys(movie_file).pop()]["0"] = { title: movie_title, pipemaster: res[1] };
                }

                for (let actor of cast) {
                    actor = actor.name;
                    if (cast_file.actors.hasOwnProperty(actor)) {
                        cast_file.actors[actor].occurrences = cast_file.actors[actor].occurrences + 1;
                        cast_file.actors[actor].movies.push(movie_title);
                    } else {
                        cast_file.actors[actor] = { occurrences: 1, movies: [movie_title] };
                    }
                }
                for (let director of directors) {
                    if (cast_file.directors.hasOwnProperty(director)) {
                        cast_file.directors[director].occurrences = cast_file.directors[director].occurrences + 1;
                        cast_file.directors[director].movies.push(movie_title);
                    } else {
                        cast_file.directors[director] = { occurrences: 1, movies: [movie_title] };
                    }
                }
                sortcast();
            }).catch(error => console.log(error));
        });
        resolve();
    });

}
function parseadd(message) {
    return new Promise((resolve, reject) => {
        let movie = "";
        message = message.slice(5);
        movie = message.substring(0, message.indexOf(" by "));
        message = message.substring(message.indexOf(" by ") + 4);
        let pipemaster = message;

        resolve([movie, pipemaster]);
    });
}

process.on("exit", () => {
    fs.writeFile("./movies.json", JSON.stringify(movie_file), function (err) {
        if (err) {
            return console.log(err);
        }
    });
    fs.writeFile("./cast.json", JSON.stringify(cast_file), function (err) {
        if (err) {
            return console.log(err);
        } else {
            return console.log("dile saved");
        }
    });
});

client.login(auth.token);