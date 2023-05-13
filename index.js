import express from 'express';
import fs from 'fs/promises';
import { nanoid } from 'nanoid';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(express.json());

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

app.get('/songs', async (req, res) => {
  // const songs = JSON.parse(fs.readFileSync('repertory.json'));
  try {
    const data = await fs.readFile('repertory.json', 'utf8');
    const songs = JSON.parse(data);
    res.json(songs);
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error,
      msg: 'There was an error reading the file',
    });
  }
});

app.post('/songs', async (req, res) => {
  const { song, artist, tune } = req.body;
  // const songs = JSON.parse(fs.readFileSync('repertory.json'));
  try {
    const data = await fs.readFile('repertory.json', 'utf8');
    const songs = await JSON.parse(data);

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

    try {
      await fs.writeFile('repertory.json', JSON.stringify(songs));
    } catch (writeError) {
      res.status(500).json({
        ok: false,
        error: writeError,
        msg: 'There was an error writing to the file',
      });
    }

    res.status(201).json({
      ok: true,
      msg: 'Song added successfully',
      songBody: req.body,
    });
  } catch (readError) {
    res.json({
      ok: false,
      error: readError,
      msg: 'There was an error adding the song',
    });
  }
});

app.delete('/songs/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const data = await fs.readFile('repertory.json');
    const songs = JSON.parse(data);
    const songIndex = songs.findIndex(song => song.id === id);
    const songDeleted = songs.filter(song => song.id === id);
    songs.splice(songIndex, 1);
    res.status(200).json({
      ok: true,
      msg: 'Song deleted successfully',
      songDeleted: songDeleted,
    });

    try {
      await fs.writeFile('repertory.json', JSON.stringify(songs));
    } catch (writeError) {
      res.status(500).json({
        ok: false,
        error: writeError,
        msg: 'There was an error writing the file',
      });
    }
  } catch (readError) {
    res.status(500).json({
      ok: false,
      error: readError,
      msg: 'There was an error deliting the song',
    });
  }
});

app.put('/songs/:id', async (req, res) => {
  const { id } = req.params;
  const { song, artist, tune } = req.body;

  try {
    const data = await fs.readFile('repertory.json');
    const songs = JSON.parse(data);
    const indexSong = songs.findIndex(song => song.id === id);

    if (indexSong === -1)
      return res.json({
        ok: false,
        error: 404,
        msg: 'Song not found',
      });

    const songUpdated = songs.filter(song => song.id === id);

    if (song !== '' && artist !== '' && tune !== '') {
      const { id } = songs[indexSong];

      const songUpdate = {
        id,
        song,
        artist,
        tune,
      };
      songs[indexSong] = songUpdate;

      try {
        await fs.writeFile('repertory.json', JSON.stringify(songs));
      } catch (writeError) {
        res.status(500).json({
          ok: false,
          error: writeError,
          msg: 'There was an error writing the file.',
        });
      }

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
  } catch (readError) {
    res.status(500).json({
      ok: false,
      error: readError,
      msg: 'There was an error reading the file',
    });
  }
});

app.listen(3000, console.log(`Servidor funcionando en puerto ${3000}`));
