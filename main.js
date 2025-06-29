import { app, BrowserWindow } from "electron";

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  win.loadURL("http://localhost:3000"); //TODO: use env var here.
  //   win.loadFile("index.html");
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
app.whenReady().then(() => {
  createWindow();
});
