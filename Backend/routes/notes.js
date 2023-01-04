const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

// route 1 : get all the notes using: GET "/api/auth/getuser". Login required

router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.mesaage);
    res.status(500).send("Internal server error occured");
  }
});

// route 2 : Add a new note using: POST "/api/auth/addnote". Login required
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Description must be atleat 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      // if there are errors return the bad request and errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNotes = await note.save();
      res.json(savedNotes);

    } catch (error) {
      console.error(error.mesaage);
      res.status(500).send("Internal server error occured");
    }
  }
);

// route 3 : Update an existing note using: PUT "/api/notes/updatenote". Login required
router.put("/updatenote/:id", fetchuser, async (req, res) => {
    const { title, description, tag} = req.body;
    // create a newNote object
    const newNote = {};
    if(title){newNote.title = title};
    if(description){newNote.description = description};
    if(tag){newNote.tag = tag};
  

  // find the note to be updated and update it
    let note = await Note.findById(req.params.id);
    if(!note){return res.status(404).send("Not Found")}

    if(note.user.toString() !== req.user.id){
      return res.status(401).send("Not Allowed");
    }

    note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new: true})
    res.json({note});
  });

  // route 4 : Delete an existing note using: DEL "/api/notes/deletenote". Login required
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  const { title, description, tag} = req.body;

// find the note to be deleted and delete it
  let note = await Note.findById(req.params.id);
  if(!note){return res.status(404).send("Not Found")}

  // Allow deletion only if user owns this Note
  if(note.user.toString() !== req.user.id){
    return res.status(401).send("Not Allowed");
  }

  note = await Note.findByIdAndDelete(req.params.id)
  res.json({"Success": "Note has been deleted", note: note});
});

module.exports = router;