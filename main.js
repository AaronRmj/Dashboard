import { app, BrowserWindow } from 'electron';
import path from 'path';
import { spawn } from 'child_process';
const isInDev = !app.isPackaged;

let backendProcess;

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
    if (isInDev)
    {
        win.loadURL('http://localhost:5173/')
    }
    else{
        // Load the frontend from dist
        win.loadFile(path.join(__dirname, 'dist', 'index.html'));
    }
}

app.whenReady().then(() => {
//   // Start the Express backend
//   backendProcess = spawn('node', ['./serverside/index.js'], {
//     stdio: 'inherit',
//     shell: true,
//   });

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (backendProcess) {
    backendProcess.kill();
  }
  if (process.platform !== 'darwin') app.quit();
});