import './styles/App.css'
import ProfileView from "./components/ProfileView.tsx"
import {theme, useThemeScene} from "./hooks/useThemeScene.ts";

export default function App() {
    useThemeScene(theme);

    return (
        <>
            <div className="bg" />
            <div className="stage">
                <div className="frame">
                    <ProfileView/>
                </div>
            </div>
        </>
    );
}