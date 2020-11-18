import React, { useState } from "react";
import { v1 as uuid } from 'uuid';

const CreateRoom = (props) => {
    const [roomId, setRoomId] = useState();

    function create() {
        const id = uuid();
        props.history.push(`/room/${id}`);
    }
    const handleChange = event => {
        setRoomId(event.target.value);
      }
    const handleSubmit = event => {
        event.preventDefault();
        props.history.push(`/room/${roomId}`);
      }
    return (
            <div className="container-fluid bg-primary" style={{height: '100vh'}}>
                <div className="row justify-content-center">
                    <div className="col-sm-12 col-md-10 col-lg-7 col-xl-6">
                        <div className="card border-0  mt-5" style={{minHeight: '400px'}}>
                            <div className="card-body p-0">
                                <div className="row">
                                    <div 
                                        style={{
                                            backgroundImage: `url(https://www.pdx.edu/world-languages/sites/g/files/znldhr2816/files/2020-08/wll-asl.jpg)`,
                                            overflow: 'hidden',
                                            minHeight: '400px',
                                            backgroundPosition: 'center',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundSize: 'cover',
                                            position: 'relative',
                                            borderRadius: 3
                                            }}
                                        className="col">
                                    </div>
                                    <div className="col-lg-6 col-sm-4">
                                        <div className="p-5">
                                            <div className="text-center">
                                                <h4 className="text-dark mb-4">Welcome to the ASL translator!</h4>
                                                <p>Join a web room to experinece the ASL live translator</p>
                                                <button className="btn btn-outline-primary btn-block" onClick={create}>Create Room</button>
                                                <br/>
                                                <p>- or -</p>
                                                <br/>
                                                <form onSubmit={handleSubmit}>
                                                    <div class="form-group align-items-start">
                                                        <label className="h5">Join a room</label>
                                                        <input type="text" class="form-control" placeholder="Enter room id" onChange={handleChange}/>
                                                        <input className="btn btn-outline-primary btn-block mt-3" value="Join Room" type="submit"/>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default CreateRoom;