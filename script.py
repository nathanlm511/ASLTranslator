import os
import matplotlib.pyplot as plt
import numpy as np
import cv2
from PIL import Image
import time
import collections
from tensorflow.keras.models import load_model



model = load_model('finalModel')

def max_char(text):
    return collections.Counter(text).most_common(1)[0][0]

video = cv2.VideoCapture(0)
text=''
flag=[]
frame_count = 0
while True:
        _, frame = video.read()
        cv2.rectangle(frame,pt1=(100,100),pt2=(300,300),color=(0,255,0),thickness=6)
        
        frame_count += 1
        
        if frame_count%150 == 0:
            
            im = Image.fromarray(frame, 'RGB')

            img_array = np.asarray(frame)

            clone = img_array[100:300, 100:300].copy()

            clone_resized = cv2.resize(clone, (64,64))

            img_array=clone_resized/255

            img_final = np.expand_dims(img_array, axis=0)

            prediction = model.predict(img_final)

            label = np.argmax(prediction)
            
        
            flag.append(ch)
            print(ch)
            
        

        cv2.imshow("Capturing", frame)
        key=cv2.waitKey(1)
        if key == ord('q'):
            break

text=''
for i in flag:
    text+=i


video.release()
cv2.destroyAllWindows()
