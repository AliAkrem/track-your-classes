
import { CreateClassModal } from './components/createClassModal';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {  GlobalContextProvider } from './context/globalContext';
// test('try to test', () => {
//   const { baseElement } = render( <App /> );

//   // expect(baseElement).toBeDefined();

// });







test('Input field should accept text', () => {
  render(
    <GlobalContextProvider >
      <CreateClassModal isOpen={true} close={() => { }} />
    </GlobalContextProvider>
  );

  const inputField = screen.getByPlaceholderText('class name');
  userEvent.type(inputField, 'Hello, World!');

  // expect(inputField.value).toBe('Hello, World!');
});