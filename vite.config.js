import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Custom Plugin to save Developer Notes directly to your VSCode files!
function devNotesPlugin() {
  return {
    name: 'dev-notes-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/save-notes' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', () => {
            try {
              // Physically writes to the json file in your codebase
              const notesPath = path.resolve(process.cwd(), 'src/data/devNotes.json');
              fs.writeFileSync(notesPath, body);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        } else {
          next();
        }
      });
    }
  }
}

export default defineConfig({
  plugins: [react(), devNotesPlugin()],
  base: './'
})
