import React from "react";

export default function LoadingSpinner({ text = "Loading workspace..." }: { text?: string }) {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50/50 z-50">
            <div className="relative flex items-center justify-center">
                {/* Background Ring */}
                <div className="w-16 h-16 border-4 border-gray-200/60 rounded-full"></div>
                {/* Foreground Spinning Ring */}
                <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-lg shadow-primary/20"></div>
                {/* Inner dot */}
                <div className="absolute w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            </div>
            <p className="mt-6 text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] animate-pulse">
                {text}
            </p>
        </div>
    );
}