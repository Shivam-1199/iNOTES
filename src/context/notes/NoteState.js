import { useState } from "react";
import NoteContext from "./noteContext";

const NoteState = (props)=>{
    const host = "http://localhost:5000"
    const notesInitial = []
          const [notes, setNotes] = useState(notesInitial)

        //   Get all Notes
        const getNotes = async ()=>{
          // TODO: API CALL
          const response = await fetch(`${host}/api/notes/fetchallnotes`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'auth-token': localStorage.getItem('token')
            },
          });
          const json = await response.json()
          setNotes(json)
          
          
        }  


        //   Add a note
          const addNote = async (title, description, tag)=>{
            // TODO: API CALL
            const response = await fetch(`${host}/api/notes//addnote`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('token')
              },
              body: JSON.stringify({title, description, tag})
            });

            const note = await response.json();
            setNotes(notes.concat(note))
            // concat returns an array whereas push updates an array

          }

        // Delete a note
          const deleteNote = async (id)=>{
            // TODO: API CALL
            const response = await fetch(`${host}/api/notes/deletenote/${id}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('token')
              },
            });
            const json = response.json();
            const newNotes = notes.filter((note)=>{return note._id!==id})
            setNotes(newNotes);
          } 

        // Edit a note
          const editNote = async (id, title, description, tag)=>{
            // api call
            const response = await fetch(`${host}/api/notes//updatenote/${id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('token')
              },
              body: JSON.stringify({title, description, tag})
            });
            const json = await response.json();
            
            let newNotes = JSON.parse(JSON.stringify(notes))
            for (let index = 0; index < newNotes.length; index++) {
              const element = newNotes[index];
              if(element._id === id){
                newNotes[index].title = title;
                newNotes[index].description = description;
                newNotes[index].tag = tag;
                break; 
              }
            }
            setNotes(newNotes);
          }

    return(
        <NoteContext.Provider value={{notes, setNotes, addNote, deleteNote, editNote, getNotes}}>
            {props.children}
        </NoteContext.Provider>
    )
}


export default NoteState;