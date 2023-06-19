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
const [image, setImage] = useState(null);


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
      const pinsWithMedia = await Promise.all(
        res.data.map(async (pin) => {
          const mediaRes = await axios.get(`/mediaFiles/${pin._id}`);
          const mediaFiles = mediaRes.data;
          return {
            ...pin,
            mediaFiles: mediaFiles.map((media) => ({
              type: media.type,
              username: media.username,
              path: media.path,
            })),
          };
        })
      );
      setPins(pinsWithMedia);
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

  const latitude  = e.lngLat.lat;
  const longitude  = e.lngLat.lng;
  
  setNewPlace({
    lat: latitude,
    long:longitude,
  })
}


const handleLike = async (pinId, userId) => {
  try {
    const response = await axios.put(`/pins/${pinId}/like`, {
      rating: userId
    });
    if (response.status === 200) {
      const updatedPin = response.data;
      setRating(updatedPin.rating);
      setPins(pins.map(pin => {
        if (pin._id === updatedPin._id) {
          return {
            ...pin,
            rating: updatedPin.rating,
          };
        }
        return pin;
      }));
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
    const pinId = res.data._id;

    const formData = new FormData();
    formData.append("file", image); 
    formData.append("pinId", pinId);
    formData.append("path", 'uploads\\' + Math.random().toString(36).slice(2, 12));
    formData.append("username", newPin.username)

    await axios.post(`/mediaFiles?pinId=${pinId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

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


const handleImageUpload = (e) => {
  setImage(e.target.files[0]); 
};


return (
    
  <Map
    initialViewState={{
      longitude: 23.800678,
      latitude: 44.319305,
      zoom: 14
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
            <label>Place {p.mediaFile}</label>
            <h3 className='place'>{p.title}</h3>
            <label>Description</label>
            <p className='desc'>{p.desc}</p>
            <label>Information</label>
            <span className='username'>Created by <b>{p.username}</b></span>
            <span className='date'>{format(p.createdAt)}</span>
            {p.mediaFiles && p.mediaFiles.map(mediaFile => (
                  <img
                    src={decodeURI(mediaFile.path)}
                    alt="Pin"
                    className="pinImage"
                  />
                )
              )
            }
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
          <input type="file" accept=".png, .jpg, .jpeg" onChange={handleImageUpload}/>
          <button className='submitButton' type='submit'>Add pin</button>
          </form>
        </div>
      </Popup>

    )}
      {currentUser ? (<button className='button logout' onClick={handleLogout}>Logout</button>) : (
        <div className='buttons'>
          <button className='button login' onClick={()=> {setShowLogin(true); setShowRegister(false)}}>Login</button>
          <button className='button register' onClick={()=>{setShowRegister(true); setShowLogin(false)}}>Register</button>
        </div>
      )}
      {showRegister && <Register setShowRegister={setShowRegister}/>}
      {showLogin && <Login setShowLogin={setShowLogin} myStorage={myStorage} setCurrentUser={setCurrentUser} setCurrentUserId={setCurrentUserId}/>}

      
      
  </Map>
)};
  
export default App;