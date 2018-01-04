# MakeCode integration

[MakeCode](https://makecode.com/) is a tool that makes programming microcontroller
boards like the micro:bit or Adafruit Circuit Playground Express simple and fun.
Programming is done by dragging and dropping blocks or using JavaScript. Uploading
code is simple as downloading the file and copying the file to the USB drive of
the microcontroller.  While iterating on code is simple and fast, the history of how the code changed is lost.  To integrate with this seriallogger2 project,
this folder has two shell scripts to automatically save the .uf2 and source code
of [MakeCode](https://makecode.com/) files.  The history of code changes can be seen along with videos and other data collected from the making process to tell a more comprehensive story.

### Instructions:

First the `runcodemakecode.sh` file should be running in the terminal.
Use MakeCode to write code for any compatible microcontroller and then download
the .UF2 file.  Copy the .UF2 file to the folder where this README is and then
the `runcodemakecode.sh` will:

* upload the .UF2 code to your microcontroller
* extract the source code from the .UF2 file and save it in a `.json` file with
the same name as the .UF2 file
* commit and push both the .UF2 and .json files to Github for automatically
record versions of your code

For convenience, you can change the download location of your browser to this folder so code will be uploaded and saved without leaving your browser.
