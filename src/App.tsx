import "./styles/App.css";
import ProfileView from "./components/ProfileView.tsx";
import { useThemeScene } from "./hooks/useThemeScene.ts";
import { profile } from "./data/profile.ts"

export default function App() {
    useThemeScene(profile.colors);

    return (
        <div className="stage">
            <ProfileView />
        </div>
    );
}