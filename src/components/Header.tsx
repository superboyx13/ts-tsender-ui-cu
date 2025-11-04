import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FaGithub } from "react-icons/fa";
import Image from "next/image";

// Header component with title, GitHub link, and wallet connect button

export default function Header() {
    return (
        <header className="flex items-center justify-between p-4 border-b bg-white">
            {/* Left section: Title + GitHub */}
            <div className="flex items-center space-x-4">
                <div className="flex items-center">
                    {/* Replace with your logo if needed */}

                    <a
                        href="https://github.com/superboyx13"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full hover:bg-blue-100 transition-colors"
                    >
                        <FaGithub size={24} />
                    </a>
                    <h1 className="ml-2 text-2xl font-bold text-gray-900">TSender</h1>
                </div>
            </div>

            {/* Right section: Connect Button */}
            <div>
                <ConnectButton
                    showBalance={true}
                    accountStatus="address"
                    label="Connect Wallet"
                />
            </div>
        </header >
    );
}