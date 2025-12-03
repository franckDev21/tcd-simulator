
import React, { useState } from 'react';
import { Landing } from './views/Landing';
import { Dashboard } from './views/Dashboard';
import { ExamRunner } from './views/ExamRunner';
import { Profile } from './views/Profile';
import { EditProfile } from './views/EditProfile';
import { Subscription } from './views/Subscription';
import { Layout } from './components/Layout';
import { AuthModal } from './components/AuthModal';
import { SeriesSelection } from './views/SeriesSelection';
import { ResultsView as Results } from './views/Results';
import { Correction } from './views/Correction';
import { AllPlans } from './views/AllPlans';
import { ContactSales } from './views/ContactSales';
import { MOCK_READING_QUESTIONS, MOCK_LISTENING_QUESTIONS, WRITING_PROMPTS } from './constants';
import { useAppStore } from './store/useAppStore';
import { ModuleType, Question } from './types';

const App = () => {
  const { view, activeModule, isAuthModalOpen, startExam } = useAppStore();
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);

  // Function to generate a full exam series (39 questions) based on module and series ID
  const generateQuestionsForSeries = (mod: ModuleType, seriesId: number): Question[] => {
     let baseQuestions: Question[] = [];
     if (mod === ModuleType.READING) baseQuestions = MOCK_READING_QUESTIONS;
     else if (mod === ModuleType.LISTENING) baseQuestions = MOCK_LISTENING_QUESTIONS;
     else return WRITING_PROMPTS; // Writing doesn't use 39 q series in this context usually, but keeping logic safe

     // Generate 39 questions by cycling through mock data
     const fullSeries: Question[] = [];
     for(let i = 0; i < 39; i++) {
        const template = baseQuestions[i % baseQuestions.length];
        fullSeries.push({
            ...template,
            id: i + 1,
            text: `${template.text} (Série ${seriesId} - Question ${i + 1})`
        });
     }
     return fullSeries;
  };

  const handleSeriesSelect = (seriesId: number) => {
      if (activeModule) {
          const questions = generateQuestionsForSeries(activeModule, seriesId);
          setCurrentQuestions(questions);
          startExam(activeModule);
      }
  };

  const renderView = () => {
    switch (view) {
      case 'LANDING': return <Landing />;
      case 'DASHBOARD': return <Dashboard onStartExam={() => {}} />;
      case 'SERIES_SELECTION': return <SeriesSelection onSelectSeries={handleSeriesSelect} />;
      case 'EXAM_RUNNER': 
        return activeModule 
            ? <ExamRunner module={activeModule} questions={currentQuestions.length > 0 ? currentQuestions : generateQuestionsForSeries(activeModule, 1)} /> 
            : <Dashboard onStartExam={() => {}} />;
      case 'RESULTS': return <Results />;
      case 'CORRECTION': return <Correction />;
      case 'PROFILE': return <Profile />;
      case 'EDIT_PROFILE': return <EditProfile />;
      case 'SUBSCRIPTION': return <Subscription />;
      case 'ALL_PLANS': return <AllPlans />;
      case 'CONTACT_SALES': return <ContactSales />;
      default: return <Landing />;
    }
  };

  return (
    <Layout>
      {renderView()}
      {isAuthModalOpen && <AuthModal />}
    </Layout>
  );
};

export default App;