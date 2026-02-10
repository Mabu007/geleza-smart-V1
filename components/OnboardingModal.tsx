import React, { useState } from 'react';
import { OnboardingData } from '../types';
import Button from './Button';

interface OnboardingModalProps {
  isOpen: boolean;
  onSubmit: (data: OnboardingData) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    gradeLevel: 'Grade 8',
    favoredCelebrity: '',
    dreamJob: '',
    hobby: '',
    bio: ''
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-[fadeIn_0.3s_ease-out]">
        <div className="bg-gradient-to-r from-fun-purple to-primary-600 p-6 text-white text-center">
          <h2 className="text-3xl font-display font-bold">Welcome to Geleza Smart! 🚀</h2>
          <p className="opacity-90 mt-2">Let's set up your profile so I can teach you better.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">What grade are you in?</label>
                <select 
                  name="gradeLevel"
                  value={formData.gradeLevel}
                  onChange={handleChange}
                  className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-0 text-lg bg-gray-50 transition-colors"
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                  ))}
                  <option value="K-12">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Who is your favorite celebrity?</label>
                <input
                  type="text"
                  name="favoredCelebrity"
                  placeholder="e.g., Taylor Swift, Elon Musk, MrBeast"
                  value={formData.favoredCelebrity}
                  onChange={handleChange}
                  className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors"
                  required
                />
              </div>
              <Button type="button" onClick={handleNext} className="w-full mt-4">Next 👉</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">What is your dream job?</label>
                <input
                  type="text"
                  name="dreamJob"
                  placeholder="e.g., Astronaut, Game Developer, Doctor"
                  value={formData.dreamJob}
                  onChange={handleChange}
                  className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">What is your favorite hobby?</label>
                <input
                  type="text"
                  name="hobby"
                  placeholder="e.g., Gaming, Soccer, Painting"
                  value={formData.hobby}
                  onChange={handleChange}
                  className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors"
                  required
                />
              </div>
              <div className="flex gap-4 mt-4">
                <Button type="button" variant="secondary" onClick={handleBack} className="flex-1">Back</Button>
                <Button type="button" onClick={handleNext} className="flex-1">Next 👉</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tell me a bit about yourself (Bio)</label>
                <textarea
                  name="bio"
                  placeholder="I love pizza and hate calculus..."
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors resize-none"
                  required
                />
              </div>
              <div className="flex gap-4 mt-4">
                <Button type="button" variant="secondary" onClick={handleBack} className="flex-1">Back</Button>
                <Button type="submit" variant="accent" className="flex-1">Start Learning! 🎓</Button>
              </div>
            </div>
          )}
          
          <div className="mt-6 flex justify-center gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary-500' : 'w-2 bg-gray-200'}`} />
            ))}
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingModal;