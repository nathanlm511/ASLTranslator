import React from 'react';
import { v1 as uuid } from 'uuid';
import './CreateRoom.css';

const CreateRoom = (props) => {
    function create() {
        const id = uuid();
        props.history.push(`/room/${id}`);
    }
    return (
        <div class="background">
            <div class="title-text">
                <span class="theme">ASL</span> Translator
            </div>
            <div class="description">
                A real-time ASL translating video chat created using <span class="theme">Tensorflow</span> and <span class="theme">WebRTC</span>
            </div>
            <div class="create-room-button" onClick={create}>Create Room</div>
        </div>
    );
};

export default CreateRoom;