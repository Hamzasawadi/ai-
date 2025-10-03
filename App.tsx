import React, { useState, useCallback } from 'react';
import { SpaceType, MoodboardOption, DesignVariation, ImageData } from './types';
import { SPACE_TYPES, MOODBOARDS } from './constants';
import { generateDesigns } from './services/geminiService';
import FileUpload from './components/FileUpload';
import Dropdown from './components/Dropdown';
import Spinner from './components/Spinner';
import Gallery from './components/Gallery';
import Modal from './components/Modal';

// A simple step component for UI clarity
const Step = ({ number, title, children }: { number: number, title: string, children: React.ReactNode }) => (
    <div className="mb-8">
        <div className="flex items-center mb-4">
            <div className="flex-shrink-0 bg-indigo-600 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold">
                {number}
            </div>
            <h2 className="ml-4 text-xl font-semibold text-gray-800">{title}</h2>
        </div>
        <div className="pl-12">
            {children}
        </div>
    </div>
);

const ASPECT_RATIO_OPTIONS = [
    { id: 'original', name: 'Original' },
    { id: '1:1', name: 'Square (1:1)' },
    { id: '3:4', name: 'Portrait (3:4)' },
    { id: '4:3', name: 'Landscape (4:3)' },
    { id: '16:9', name: 'Wide (16:9)' }
];

const IMAGE_QUALITY_OPTIONS = [
    { id: 'standard', name: 'Standard' },
    { id: 'hd', name: 'HD' },
    { id: 'ultra', name: 'Ultra HD' }
];

const App: React.FC = () => {
    const [view, setView] = useState<'studio' | 'results'>('studio');
    const [roomImage, setRoomImage] = useState<ImageData | null>(null);
    const [spaceType, setSpaceType] = useState<SpaceType>(SpaceType.LivingRoom);
    const [moodboard, setMoodboard] = useState<MoodboardOption>(MOODBOARDS[0]);
    const [customMoodboardImage, setCustomMoodboardImage] = useState<ImageData | null>(null);
    const [aspectRatio, setAspectRatio] = useState<string>('original');
    const [imageQuality, setImageQuality] = useState<string>('standard');
    
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedDesignsResult, setGeneratedDesignsResult] = useState<DesignVariation[]>([]);
    const [gallery, setGallery] = useState<DesignVariation[][]>([]);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const openModal = (imageSrc: string) => {
        setSelectedImage(imageSrc);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedImage(null);
    };

    const handleGenerate = useCallback(async () => {
        if (!roomImage) {
            setError('Please upload a room image.');
            return;
        }

        if (moodboard.id === 'custom' && !customMoodboardImage) {
            setError('Please upload a custom moodboard image.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedDesignsResult([]);
        setView('results');

        try {
            const designs = await generateDesigns(roomImage, customMoodboardImage, spaceType, moodboard.name, aspectRatio, imageQuality);
            if (designs.length < 2) {
                setError('Could not generate two distinct designs. The model may have returned a limited response. Please try again.');
            } else {
                setGeneratedDesignsResult(designs);
                setGallery(prev => [designs, ...prev].slice(0, 10)); // Keep gallery size manageable
            }
        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(`An error occurred while generating designs: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [roomImage, spaceType, moodboard, customMoodboardImage, aspectRatio, imageQuality]);

    const isGenerateDisabled = !roomImage || isLoading || (moodboard.id === 'custom' && !customMoodboardImage);

    const renderStudio = () => (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Record List / Gallery */}
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center border-b pb-4">Inspiration Gallery</h2>
                 {gallery.length > 0 ? (
                    <div className="max-h-[80vh] overflow-y-auto pr-2">
                        <Gallery results={gallery} />
                    </div>
                ) : (
                    <div className="text-center text-gray-500 mt-8 flex flex-col items-center justify-center h-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p>Your generated designs will appear here.</p>
                    </div>
                )}
            </div>
            {/* Right Column: Inputs */}
            <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-lg">
                <Step number={1} title="Upload Your Room">
                    <FileUpload label="Upload your Room Image or Sketch" onFileChange={setRoomImage} preview={roomImage?.base64} />
                </Step>
                 <Step number={2} title="Select Space Type">
                    <div className="w-full max-w-md">
                         <Dropdown
                            options={SPACE_TYPES}
                            value={spaceType}
                            onChange={e => setSpaceType(e.target.value as SpaceType)}
                        />
                    </div>
                </Step>
                 <Step number={3} title="Choose a Style">
                     <div className="flex flex-wrap gap-3">
                        {MOODBOARDS.map(mb => (
                            <button 
                                key={mb.id} 
                                onClick={() => setMoodboard(mb)}
                                className={`px-4 py-2 rounded-full font-semibold border-2 transition-all duration-200 ${moodboard.id === mb.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-500 hover:text-indigo-500'}`}
                            >
                                {mb.name}
                            </button>
                        ))}
                    </div>
                    {moodboard.id === 'custom' && (
                        <div className="mt-6">
                             <FileUpload label="Upload Your Own Moodboard" onFileChange={setCustomMoodboardImage} preview={customMoodboardImage?.base64} />
                        </div>
                    )}
                </Step>
                <Step number={4} title="Select Aspect Ratio">
                     <div className="flex flex-wrap gap-3">
                        {ASPECT_RATIO_OPTIONS.map(option => (
                            <button 
                                key={option.id} 
                                onClick={() => setAspectRatio(option.id)}
                                className={`px-4 py-2 rounded-full font-semibold border-2 transition-all duration-200 ${aspectRatio === option.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-500 hover:text-indigo-500'}`}
                            >
                                {option.name}
                            </button>
                        ))}
                    </div>
                </Step>
                <Step number={5} title="Select Image Quality">
                     <div className="flex flex-wrap gap-3">
                        {IMAGE_QUALITY_OPTIONS.map(option => (
                            <button 
                                key={option.id} 
                                onClick={() => setImageQuality(option.id)}
                                className={`px-4 py-2 rounded-full font-semibold border-2 transition-all duration-200 ${imageQuality === option.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-500 hover:text-indigo-500'}`}
                            >
                                {option.name}
                            </button>
                        ))}
                    </div>
                </Step>
            </div>
        </div>
    );

    const renderResults = () => (
        <div className="w-full text-center p-8 bg-white rounded-xl shadow-lg">
            {isLoading && (
                <div className="flex flex-col items-center justify-center min-h-[50vh]">
                    <Spinner />
                    <p className="text-lg text-gray-600 mt-4 animate-pulse">Generating your designs... this may take a moment.</p>
                    <p className="text-sm text-gray-500 mt-2">The AI is reimagining your space!</p>
                </div>
            )}
            {error && (
                 <div>
                    <p className="text-red-500 bg-red-100 p-4 rounded-md mb-6">{error}</p>
                    <button onClick={() => setView('studio')} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700">Back to Studio</button>
                </div>
            )}
            {!isLoading && generatedDesignsResult.length > 0 && (
                 <div className="w-full">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Your New Designs</h2>
                    <p className="text-gray-500 mb-8">Click on an image to view it larger and download.</p>
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        {generatedDesignsResult.map((design, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                                <button onClick={() => openModal(design.image)} className="w-full block cursor-pointer group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-t-lg">
                                     <img src={design.image} alt={`Design Variation ${index + 1}`} className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-300"/>
                                </button>
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Design Concept #{index + 1}</h3>
                                    <p className="text-gray-600 text-left">{design.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                     <button onClick={() => setView('studio')} className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700">Create Another Design</button>
                </div>
            )}
        </div>
    );
    
    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
            <header className="bg-white shadow-md sticky top-0 z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center">
                    <h1 className="text-3xl font-bold text-indigo-600">AI Interior Designer</h1>
                     {view === 'studio' && (
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerateDisabled}
                            className="mt-4 sm:mt-0 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                        >
                            {isLoading ? 'Generating...' : 'Generate Designs'}
                        </button>
                     )}
                     {view === 'results' && !isLoading &&(
                        <button
                            onClick={() => setView('studio')}
                            className="mt-4 sm:mt-0 px-8 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-colors duration-300"
                        >
                           Back to Studio
                        </button>
                     )}
                </div>
            </header>
            
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {view === 'studio' ? renderStudio() : renderResults()}
            </main>

            {selectedImage && (
                <Modal 
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    imageSrc={selectedImage}
                    imageAlt="Enlarged design variation"
                />
            )}
        </div>
    );
};

export default App;