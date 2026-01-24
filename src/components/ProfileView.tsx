import AcrylicSlab from "./AcrylicSlab";
import {InfoBlock} from "./InfoBlock.tsx";
import CtaButtonContainer from "./CtaButtonContainer.tsx";
import UtilityButtonContainer from "./UtilityButtonContainer.tsx";
import "../styles/button.css";

export default function ProfileView() {

    return (
        <div className="poster">
            <AcrylicSlab/>
            <InfoBlock/>
            <CtaButtonContainer/>
            <UtilityButtonContainer/>
        </div>
    );
}