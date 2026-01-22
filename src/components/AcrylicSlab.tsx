import Rain from "../img/rain.webp"
import {useInertialRotation} from "../hooks/useInertialRotation.ts";

const image = Rain;
const name = "Rain";

export default function AcrylicSlab() {

    const { rotY, dragging, bind } = useInertialRotation();

    return (
        <div className="card3d" {...bind}>

            <div
                className={`card3dInner ${dragging ? "dragging" : ""}`}
                style={{transform: `rotateY(${rotY}deg)`}}
            >

                <div className="cardFace cardFront">
                    <img
                        className="posterImg"
                        src={image}
                        alt={name}
                        draggable={false}
                        loading="eager"
                        fetchPriority="high"
                    />
                </div>

                <div className="cardSide sideTop"></div>
                <div className="cardSide sideBottom"></div>
                <div className="cardSide sideLeft"></div>
                <div className="cardSide sideRight"></div>

                <div className="cardFace cardBack">
                    <img
                        src={image}
                        alt=""
                        draggable={false}
                        className="posterImg posterImgBack"
                    />
                </div>

            </div>
        </div>
    )
}