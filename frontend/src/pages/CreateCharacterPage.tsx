// frontend/src/pages/CreateCharacterPage.tsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createCharacter } from '../store/slices/characterSlice';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface FormData {
  name: string;
  class: string;
  faction: string;
}

interface FormErrors {
  name?: string;
  class?: string;
  faction?: string;
}

const CreateCharacterPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    class: '',
    faction: ''
  });
  
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [characterPreview, setCharacterPreview] = useState<string | null>(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: any) => state.character);
  
  const classes = [
    { id: 'warrior', name: 'Warrior', description: 'Strong melee fighter with high health and defense.' },
    { id: 'mage', name: 'Mage', description: 'Powerful spellcaster with strong magical abilities.' },
    { id: 'rogue', name: 'Rogue', description: 'Quick and stealthy fighter with high critical chance.' },
    { id: 'priest', name: 'Priest', description: 'Divine spellcaster with healing and support magic.' }
  ];
  
  const factions = [
    { id: 'avrelia', name: 'Avrelia', description: 'Noble kingdom of light and order.' },
    { id: 'inferno', name: 'Inferno', description: 'Dark faction of chaos and power.' }
  ];
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors({ ...formErrors, [name]: undefined });
    }
    
    // Update character preview
    if (name === 'class' || name === 'faction') {
      updateCharacterPreview(
        name === 'class' ? value : formData.class,
        name === 'faction' ? value : formData.faction
      );
    }
  };
  
  const updateCharacterPreview = (characterClass: string, faction: string) => {
    if (characterClass && faction) {
      // In a real app, we would load actual character preview images
      setCharacterPreview(`/assets/previews/${faction}_${characterClass}.png`);
    } else {
      setCharacterPreview(null);
    }
  };
  
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;
    
    if (!formData.name.trim()) {
      errors.name = 'Character name is required';
      isValid = false;
    } else if (formData.name.length < 3) {
      errors.name = 'Name must be at least 3 characters long';
      isValid = false;
    } else if (formData.name.length > 20) {
      errors.name = 'Name must be less than 20 characters';
      isValid = false;
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.name)) {
      errors.name = 'Name can only contain letters, numbers, underscores, and hyphens';
      isValid = false;
    }
    
    if (!formData.class) {
      errors.class = 'Please select a class';
      isValid = false;
    }
    
    if (!formData.faction) {
      errors.faction = 'Please select a faction';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const result = await dispatch(createCharacter(formData) as any);
      
      if (result.type.endsWith('/fulfilled')) {
        navigate('/character/select');
      }
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-display text-primary mb-8">Create New Character</h1>
      
      {error && (
        <div className="p-4 mb-6 bg-accent/20 border border-accent rounded-md text-accent">
          {error}
        </div>
      )}
      
      <div className="bg-surface rounded-lg shadow-card p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-text-secondary mb-2">Character Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full bg-background text-text-primary p-3 rounded-md border ${
                formErrors.name ? 'border-accent' : 'border-gray-700'
              }`}
            />
            {formErrors.name && (
              <p className="mt-1 text-accent text-sm">{formErrors.name}</p>
            )}
          </div>
          
          <div>
            <label className="block text-text-secondary mb-2">Select Class</label>
            <div className="space-y-3">
              {classes.map(characterClass => (
                <label 
                  key={characterClass.id}
                  className={`block p-3 rounded-md border cursor-pointer transition-colors ${
                    formData.class === characterClass.id 
                      ? 'border-primary bg-primary/10' 
                      : 'border-gray-700 hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="class"
                      value={characterClass.id}
                      checked={formData.class === characterClass.id}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="mr-3 w-6 h-6 rounded-full border-2 flex items-center justify-center">
                      {formData.class === characterClass.id && (
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold">{characterClass.name}</div>
                      <div className="text-sm text-text-secondary">{characterClass.description}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {formErrors.class && (
              <p className="mt-1 text-accent text-sm">{formErrors.class}</p>
            )}
          </div>
          
          <div>
            <label className="block text-text-secondary mb-2">Select Faction</label>
            <div className="space-y-3">
              {factions.map(faction => (
                <label 
                  key={faction.id}
                  className={`block p-3 rounded-md border cursor-pointer transition-colors ${
                    formData.faction === faction.id 
                      ? faction.id === 'avrelia' ? 'border-blue-500 bg-blue-500/10' : 'border-red-500 bg-red-500/10'
                      : 'border-gray-700 hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="faction"
                      value={faction.id}
                      checked={formData.faction === faction.id}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`mr-3 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      faction.id === 'avrelia' ? 'border-blue-500' : 'border-red-500'
                    }`}>
                      {formData.faction === faction.id && (
                        <div className={`w-3 h-3 rounded-full ${
                          faction.id === 'avrelia' ? 'bg-blue-500' : 'bg-red-500'
                        }`}></div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold">{faction.name}</div>
                      <div className="text-sm text-text-secondary">{faction.description}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {formErrors.faction && (
              <p className="mt-1 text-accent text-sm">{formErrors.faction}</p>
            )}
          </div>
          
          <div className="md:col-span-2 mt-6">
            <button 
              type="submit" 
              className="w-full md:w-auto py-3 px-6 bg-primary text-background font-bold rounded-md hover:bg-primary/90 transition-colors"
              disabled={loading}
            >
              Create Character
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCharacterPage;