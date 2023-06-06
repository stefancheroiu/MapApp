import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Room, Favorite, Send } from '@material-ui/icons';
import { useEffect, useState } from 'react';
import './app.css'
import axios from 'axios';
import { format } from 'timeago.js';
import Register from './components/Register';
import Login from './components/Login'


function App() {

const myStorage = window.localStorage;
const [currentUser, setCurrentUser] = useState(myStorage.getItem("user"));
const [currentUserId, setCurrentUserId] = useState(myStorage.getItem("userId"));
const [pins, setPins] = useState([]);
const [currentPlaceId, setCurrentPlaceId] = useState(null);
const [newPlace, setNewPlace] = useState(null);
const [title, setTitle] = useState(null);
const [desc, setDesc] = useState(null);
const [showRegister, setShowRegister] = useState(false);
const [showLogin, setShowLogin] = useState(false);
const [rating, setRating] = useState([]);
const [comments, setComments] = useState({});


useEffect(() => {
  const fetchComments = async (pinId) => {
    try {
      const res = await axios.get(`/comments/${pinId}`);
      setComments((prevComments) => ({
        ...prevComments,
        [pinId]: res.data,
      }));
    } catch (err) {
      console.log(err);
    }
  };
  fetchComments();

  const getPins = async () => {
    try {
      const res = await axios.get("/pins");
      setPins(res.data);
      res.data.forEach((pin) => {
        fetchComments(pin._id);
      });
    } catch (err) {
      console.log(err);
    }
  };

  getPins();
}, []);


const handleCommentSubmit = async (pinId, comment) => {
  console.log("Username:", currentUser);
  console.log("Body:", comment);
  console.log("Pin ID:", pinId);
  try {
    const res = await axios.post("/comments", {
      username: currentUser,
      body: comment,
      pinId: pinId,
    });

    const newComment = res.data;

    setComments((prevComments) => ({
      ...prevComments,
      [pinId]: [...prevComments[pinId], newComment],
    }));
  } catch (err) {
    console.log(err);
  }
};

const handleMarkerClick = (id, lat, long) => {
  setCurrentPlaceId(id)
}
const handleAddClick = (e)=>{

  const longitude  = e.lngLat.lng;
  const latitude  = e.lngLat.lat;
  
  setNewPlace({
    lat: latitude,
    long:longitude
  })
}

const handleLike = async (pinId, userId) => {
  console.log(userId)
  try {
    const response = await axios.put(`/pins/${pinId}/like`, {
      //rating: rating === pinId ? rating - 1 : rating + 1,
      rating: userId
    });

    if (response.status === 200) {
      const updatedPin = response.data;
      setRating(updatedPin.rating);
      const updatedPins = pins.map((pin) =>
        pin._id === updatedPin._id ? updatedPin : pin
      );
      setPins(updatedPins);
    } else {
      console.error("Failed to update pin rating");
    }
  } catch (error) {
    console.error("Failed to update pin rating", error);
  }
};


const handleSubmit = async (e) => {
  e.preventDefault();
  const newPin = {
    username: currentUser,
    title,
    desc,
    lat: newPlace.lat,
    long: newPlace.long,
  };

  try {
    const res = await axios.post("/pins", newPin);
    setPins([...pins, res.data]);
    setNewPlace(null);
  } catch (err) {
    console.log(err);
  }
};

const handleLogout = () => {
  myStorage.removeItem("user");
  setCurrentUser(null);
}


return (
    
<Map
  initialViewState={{
    longitude: 23.800678,
    latitude: 44.319305,
    zoom: 12
  }}
    style={{width: '100vw', height: '100vh'}}
    mapboxAccessToken={process.env.REACT_APP_MAPBOX}
    mapStyle="mapbox://styles/mapbox/streets-v12"
    onDblClick={handleAddClick}
    doubleClickZoom={false}
>
  {pins.map(p=>(
    <>
    <Marker
    key = {p._id}
    longitude={p.long} 
    latitude={p.lat} 
    anchor="bottom" >
      <Room 
        style={{color: p.username === currentUser ? "#00ccff":"#70222b", cursor:"pointer"}}
        onClick = {()=>handleMarkerClick(p._id, p.lat, p.long)}  
      />
    </Marker>
    {p._id === currentPlaceId && (
      <Popup 
        longitude={p.long} 
        latitude={p.lat}
        closeButton={true}
        anchor="left"
        closeOnClick={false}
        onClose={()=>setCurrentPlaceId(null)}
      >
        <div className='card'>
          <label>Place</label>
          <h3 className='place'>{p.title}</h3>
          <label>Description</label>
          <p className='desc'>{p.desc}</p>
          <label>Information</label>
          <span className='username'>Created by <b>{p.username}</b></span>
          <span className='date'>{format(p.createdAt)}</span>
          <label>Photo</label>
          <div className='likeSection'>
            {p.rating.length}
            <Favorite onClick={() => handleLike(p._id, currentUserId)} className='likeButton'/>
          </div>
          <hr></hr>
          {comments[p._id] && (
            <div className='commentSection'>
              <form onSubmit={(e) => {e.preventDefault();handleCommentSubmit(p._id, e.target[0].value)}}>
                <input className='commentInput' type='text' placeholder='Add a comment...' />
                <button className='buttonSend' type='submit'><Send className='sendButton'/></button>
              </form>
              {comments[p._id].map((comment) => (
                <div className='comment' key={comment._id}>
                  <span className='commentUsername'><i><b>{comment.username}</b></i></span>
                  <span className='commentBody'>{comment.body}</span>
                </div>
              ))}
            </div>
          )}  
        </div>
      </Popup>
    )}
    
    </>
  ))}
  {newPlace && (
    <Popup 
    longitude={newPlace.long} 
    latitude={newPlace.lat}
    closeButton={true}
    anchor="left"
    closeOnClick={false}
    onClose={()=>setNewPlace(null)}
    >
      <div>
        <form className='pinForm' onSubmit={handleSubmit}>
        <label>Place</label>
        <input onChange={(e)=> setTitle(e.target.value)} placeholder='Enter the name of the place'></input>
        <label>Description</label>
        <input onChange={(e)=> setDesc(e.target.value)} placeholder='Say something about this place'></input>
        <button className='submitButton' type='submit'>Add pin</button>
        </form>
      </div>
    </Popup>

  )}
    {currentUser ? (<button className='button logout' onClick={handleLogout}>Logout</button>) : (
      <div className='buttons'>
        <button className='button login' onClick={()=>setShowLogin(true)}>Login</button>
        <button className='button register' onClick={()=>setShowRegister(true)}>Register</button>
      </div>
    )}
    {showRegister && <Register setShowRegister={setShowRegister}/>}
    {showLogin && <Login setShowLogin={setShowLogin} myStorage={myStorage} setCurrentUser={setCurrentUser} setCurrentUserId={setCurrentUserId}/>}

    
    
</Map>
  );
}

export default App;