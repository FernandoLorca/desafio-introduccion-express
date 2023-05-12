import express from 'express';
import fs from 'fs';
import { nanoid } from 'nanoid';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(express.json());

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

app.get('/songs', (req, res) => {
  const songs = JSON.parse(fs.readFileSync('repertory.json'));
  res.json(songs);
});

app.post('/songs', (req, res) => {
  const { song, artist, tune } = req.body;
  const songs = JSON.parse(fs.readFileSync('repertory.json'));

  const newSong = {
    id: nanoid(),
    song,
    artist,
    tune,
  };

  if (song !== '' || artist !== '' || tune !== '') {
    songs.push(newSong);
  } else {
    return res.status(401).send('Song, artist or tune are not valid!');
  }

  fs.writeFileSync('repertory.json', JSON.stringify(songs));
  res.status(201).json({
    ok: true,
    msg: 'Song added successfully',
    songBody: req.body,
  });
});

app.delete('/songs/:id', (req, res) => {
  const { id } = req.params;
  const songs = JSON.parse(fs.readFileSync('repertory.json'));
  const songIndex = songs.findIndex(song => song.id === id);
  const songDeleted = songs.filter(song => song.id === id);
  songs.splice(songIndex, 1);
  fs.writeFileSync('repertory.json', JSON.stringify(songs));
  res.status(200).json({
    ok: true,
    msg: 'Song deleted successfully',
    songDeleted: songDeleted,
  });
});

app.put('/songs/:id', (req, res) => {
  const { id } = req.params;
  const { song, artist, tune } = req.body;
  const songs = JSON.parse(fs.readFileSync('repertory.json'));
  const indexSong = songs.findIndex(song => song.id === id);
  const songUpdated = songs.filter(song => song.id === id);

  if (indexSong === -1)
    return res.json({
      ok: false,
      error: 404,
      msg: 'Song not found',
    });

  if (song !== '' && artist !== '' && tune !== '') {
    const { id } = songs[indexSong];

    const songUpdate = {
      id,
      song,
      artist,
      tune,
    };
    songs[indexSong] = songUpdate;

    fs.writeFileSync('repertory.json', JSON.stringify(songs));
    res.json({
      ok: true,
      msg: 'Song updated successfully',
      dataChange: {
        oldSong: songUpdated[0],
        newSong: songUpdate,
      },
    });
  } else {
    res.json({
      ok: false,
      error: 400,
      msg: 'Data must be something',
    });
  }
});

app.listen(3000, console.log(`Servidor funcionando en puerto ${3000}`));
