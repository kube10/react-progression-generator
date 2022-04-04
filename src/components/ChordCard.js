const ChordCard = ({ chord }) => {
  return (
    <div className="card">
      <div className="card-header d-flex align-items-center justify-content-between">
        <h6 className="card-title m-0">{chord.name}</h6>
        <h6 className="card-subtitle text-muted m-0">{chord.degreeRoman}</h6>
      </div>
      <div className="card-body">
        <div className="d-flex justify-content-between">
          {chord.notes.map((note, i) => (
            <div key={i} className="badge bg-light text-dark fw-normal">
              {note}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChordCard;
