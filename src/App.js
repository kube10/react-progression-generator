import { useState, useEffect } from "react";
import ChordCard from "./components/ChordCard";

function App() {
  const [notes, setNotes] = useState([]);
  const [scales, setScales] = useState([]);
  const [progression, setProgression] = useState();
  const [selectedTonic, setSelectedTonic] = useState("random");
  const [selectedScale, setSelectedScale] = useState("random");

  useEffect(() => {
    const getNotes = async () => {
      const notesFromAPI = await fetchNotes();
      setNotes(notesFromAPI);
    };
    getNotes();

    const getScales = async () => {
      const scalesFromAPI = await fetchScales();
      setScales(scalesFromAPI);
    };
    getScales();
  }, []);

  const buildChordsFromScale = (scales, notes, tonic, type) => {
    let scale;

    scales.forEach((sc, i) => {
      if (sc.type === type) {
        scale = sc;
      }
    });

    if (scale) {
      const notesInScale = [];
      let tonicIndex = notes.indexOf(tonic);
      let adjustment = 0;

      const rearranged = [];
      let count = 0;

      while (rearranged.length < notes.length) {
        if (tonicIndex + count < notes.length) {
          rearranged.push(notes[tonicIndex + count]);
        } else {
          count = 0;
          rearranged.push(notes[count]);
        }
        count++;
      }

      console.log(rearranged);

      scale.intervals.forEach((interval, i) => {
        if (interval + tonicIndex > notes.length) {
          const diff = interval + tonicIndex - notes.length;
          tonicIndex = diff;
          adjustment = interval * -1;
        }
        console.log("Index: " + (scale.intervals[i] + adjustment + tonicIndex));
        console.log("Interval: " + scale.intervals[i]);
        console.log("adjustment: " + adjustment);
        console.log("tonicIndex: " + tonicIndex);
        const noteToAdd = notes[scale.intervals[i] + adjustment + tonicIndex];

        notesInScale.push(noteToAdd);
      });

      console.log(notesInScale);

      const chordsInScale = [];
      notesInScale.forEach((note, i) => {
        let thirdAdjustment = 0;
        let fifthAdjustment = 0;
        let startThird = i;
        let startFifth = i;
        if (i + 4 >= notesInScale.length) {
          const diff = notesInScale.length - notesInScale.indexOf(note);
          startFifth = 0;
          fifthAdjustment = diff;
        }
        if (i + 2 >= notesInScale.length) {
          const diff = notesInScale.length - notesInScale.indexOf(note);
          startThird = 0;
          thirdAdjustment = diff;
        }

        let name = note;
        const third = notesInScale[startThird + 2 - thirdAdjustment];
        const fifth = notesInScale[startFifth + 4 - fifthAdjustment];

        if (notes.indexOf(third) > notes.indexOf(note)) {
          if (notes.indexOf(note) + 3 === notes.indexOf(third)) {
            name = note + "m";
          }
        } else {
          if (notes.indexOf(third) + 9 === notes.indexOf(note)) {
            name = note + "m";
          }
        }

        if (notes.indexOf(fifth) > notes.indexOf(note)) {
          if (notes.indexOf(note) + 6 === notes.indexOf(fifth)) {
            name = note + "dim";
          }
        } else {
          if (notes.indexOf(fifth) + 6 === notes.indexOf(note)) {
            name = note + "dim";
          }
        }

        const degrees = ["I", "II", "III", "IV", "V", "VI", "VII"];

        const chord = {
          name,
          degree: i + 1,
          degreeRoman: degrees[i],
          notes: [note, third, fifth],
        };
        chordsInScale.push(chord);
      });

      console.log(notesInScale);

      const adjustedNoteNames = [];

      if (notesInScale[0].indexOf("#") === -1) {
        let firstSharpId;

        notesInScale.forEach((note, i) => {
          if (!firstSharpId) {
            if (note.indexOf("#") > -1) {
              firstSharpId = i;
            }
          }
        });

        console.log("firsthsarp: " + firstSharpId);
        const names = notesInScale[firstSharpId].split("/");
        const natural = names[0].substr(0, 1);
        let sharps = false;
        if (notesInScale[firstSharpId - 1].indexOf(natural) === -1) {
          sharps = true;
        }

        notesInScale.forEach((note, i) => {
          let singleName;
          if (note.indexOf("#") > -1) {
            const names = note.split("/");
            const natural = names[0].substr(0, 1);
            if (sharps) {
              singleName = names[0];
            } else {
              singleName = names[1];
            }
          } else {
            singleName = note;
          }
          adjustedNoteNames.push({
            original: note,
            single: singleName,
          });
        });

        // notesInScale.forEach((note, i) => {
        //   let singleName;
        //   if (note.indexOf("#") > -1) {
        //     const names = note.split("/");
        //     const natural = names[0].substr(0, 1);
        //
        //     if (notesInScale[i - 1].indexOf(natural) > -1) {
        //       singleName = names[1];
        //     } else if (adjustedNoteNames[i - 1].single.indexOf("#") > -1) {
        //       singleName = names[0];
        //     } else {
        //       singleName = names[0];
        //     }
        //   } else {
        //     singleName = note;
        //   }
        //
        //   adjustedNoteNames.push({
        //     original: note,
        //     single: singleName,
        //   });
        // });
      } else {
        const random = randomIntFromInterval(0, 1);
        notesInScale.forEach((note, i) => {
          if (note.indexOf("#") > -1) {
            const names = note.split("/");
            let singleName = names[random];
            adjustedNoteNames.push({
              original: note,
              single: singleName,
            });
          }
        });
      }

      console.log(adjustedNoteNames);

      chordsInScale.forEach((chord, i) => {
        if (chord.name.indexOf("#") > -1) {
          adjustedNoteNames.forEach((nameObject, i) => {
            if (chord.name.indexOf(nameObject.original) > -1) {
              chord.name = chord.name.replace(
                nameObject.original,
                nameObject.single
              );
            }
          });
        }
        // chord.notes.forEach((note, x) => {
        //   adjustedNoteNames.forEach((nameObject, i) => {
        //     if (note.indexOf(nameObject.original) > -1) {
        //       note = note.replace(nameObject.original, nameObject.single);
        //     }
        //   });
        // });
      });

      return chordsInScale;
    }
  };

  const fetchNotes = async () => {
    const res = await fetch("http://localhost:5000/notes");
    const data = await res.json();
    return data;
  };

  const fetchScales = async () => {
    const res = await fetch("http://localhost:5000/scales");
    const data = await res.json();
    return data;
  };

  const onGenerate = () => {
    let scaleId;
    if (selectedScale === "random") {
      scaleId = randomIntFromInterval(0, scales.length - 1);
    } else {
      scales.forEach((scale, i) => {
        if (scale.type === selectedScale) {
          scaleId = i;
        }
      });
    }

    let tonicId;
    if (selectedTonic === "random") {
      tonicId = randomIntFromInterval(0, 11);
    } else {
      tonicId = notes.indexOf(selectedTonic);
    }

    const chordsInScale = buildChordsFromScale(
      scales,
      notes,
      notes[tonicId],
      scales[scaleId].type
    );
    const progressionLength = 4;
    let chordIds = [];
    for (var i = 0; i < progressionLength; i++) {
      const chordId = randomIntFromInterval(0, chordsInScale.length - 1);
      chordIds.push(chordId);
    }
    let progression = {
      scale: notes[tonicId] + " " + scales[scaleId].type,
      chords: [],
    };
    chordIds.forEach((id) => {
      progression.chords.push(chordsInScale[id]);
    });
    setProgression(progression);
  };

  const randomIntFromInterval = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  return (
    <div className="App container py-4">
      <div className="row">
        <div className="col-lg-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onGenerate();
            }}
          >
            <div className="form-group mb-2">
              <select
                name=""
                id=""
                className="form-select"
                value={selectedScale}
                onChange={(event) => setSelectedScale(event.target.value)}
              >
                {scales &&
                  scales.map((scale, i) => (
                    <option key={i} value={scale.type}>
                      {scale.type}
                    </option>
                  ))}
                <option value="random">Random</option>
              </select>
            </div>
            <div className="form-group mb-2">
              <select
                name=""
                id=""
                className="form-select"
                value={selectedTonic}
                onChange={(event) => setSelectedTonic(event.target.value)}
              >
                {notes &&
                  notes.map((note, i) => (
                    <option key={i} value={note}>
                      {note}
                    </option>
                  ))}
                <option value="random">Random</option>
              </select>
            </div>
            <input
              className="btn btn-primary"
              type="submit"
              value="  Generate Chord Progression"
            />
          </form>
        </div>
        <div className="col-lg-8">
          <div className="container-fluid p-0">
            {progression && (
              <div className="row">
                <h6 className="mb-4">Progression in {progression.scale}</h6>
                {progression.chords.map((chord, i) => (
                  <div className="col-lg-3" key={i}>
                    <ChordCard chord={chord} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
