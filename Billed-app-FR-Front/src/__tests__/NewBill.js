/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import userEvent from '@testing-library/user-event';
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import BillsUI from "../views/BillsUI.js";
import NewBill from "../containers/NewBill.js";
import router from "../app/Router.js";



describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill page and I select a file in a correct format", () => {
    test("Then the input should display the file name", () => {

      // Création page NewBill
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      // Initie la page NewBill
      const newBill = new NewBill({
        document,
        onNavigate,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      const fileName = screen.getByTestId('file');

      fileName.addEventListener('change', handleChangeFile);
      fireEvent.change(fileName, {
        target: {
          files: [new File(['image.png'], 'image.png', {
            type: 'image/png'
          })],
        }
      })
      //  Vérifie que la fonction handleChangeFile est bien appelée
      expect(handleChangeFile).toHaveBeenCalled()
      //  Vérifie que le fichier possède une bonne extension
      expect(fileName.files[0].name).toBe('image.png');
    })
  })

  describe("When I am on NewBill page and I click on the submit button", () => {
    test("Then a bill is created", () => {

      // Création page NewBill
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      // Initie la page NewBill
      const newBill = new NewBill({
        document,
        onNavigate,
        localStorage: window.localStorage,
      });

      const handleSubmit = jest.fn(newBill.handleSubmit)
      const submit = screen.getByTestId('form-new-bill');

      submit.addEventListener('submit', handleSubmit);
      fireEvent.submit(submit)
      //  Vérifie que la fonction handleSubmit est bien appelée
      expect(handleSubmit).toHaveBeenCalled();
    })
  })
})


// Test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I add a new bill", () => {
    test("Then it creates a new bill", () => {

      // Création page NewBill
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      // Initie la page NewBill
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const newBill = new NewBill({
        document,
        onNavigate,
        localStorage: window.localStorage,
      });

      const inputData = {
        type: 'Transports',
        name: 'Test',
        datepicker: '2021-05-26',
        amount: '100',
        vat: '10',
        pct: '19',
        commentary: 'Test',
        file: new File(['test'], 'test.png', { type: 'image/png' }),
      }

      // Récupération des éléments de la page
      const formNewBill = screen.getByTestId('form-new-bill')
      const inputExpenseName = screen.getByTestId('expense-name')
      const inputExpenseType = screen.getByTestId('expense-type')
      const inputDatepicker = screen.getByTestId('datepicker')
      const inputAmount = screen.getByTestId('amount')
      const inputVAT = screen.getByTestId('vat')
      const inputPCT = screen.getByTestId('pct')
      const inputCommentary = screen.getByTestId('commentary')
      const inputFile = screen.getByTestId('file')

      // Renseignement des valeurs
      fireEvent.change(inputExpenseType, {
        target: { value: inputData.type },
      })
      expect(inputExpenseType.value).toBe(inputData.type)

      fireEvent.change(inputExpenseName, {
        target: { value: inputData.name },
      })
      expect(inputExpenseName.value).toBe(inputData.name)

      fireEvent.change(inputDatepicker, {
        target: { value: inputData.datepicker },
      })
      expect(inputDatepicker.value).toBe(inputData.datepicker)

      fireEvent.change(inputAmount, {
        target: { value: inputData.amount },
      })
      expect(inputAmount.value).toBe(inputData.amount)

      fireEvent.change(inputVAT, {
        target: { value: inputData.vat },
      })
      expect(inputVAT.value).toBe(inputData.vat)

      fireEvent.change(inputPCT, {
        target: { value: inputData.pct },
      })
      expect(inputPCT.value).toBe(inputData.pct)

      fireEvent.change(inputCommentary, {
        target: { value: inputData.commentary },
      })
      expect(inputCommentary.value).toBe(inputData.commentary)

      userEvent.upload(inputFile, inputData.file)
      expect(inputFile.files[0]).toStrictEqual(inputData.file)
      expect(inputFile.files).toHaveLength(1)

      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() =>
            JSON.stringify({
              email: 'email@test.com',
            })
          ),
        },
        writable: true,
      })

      const handleSubmit = jest.fn(newBill.handleSubmit)

      formNewBill.addEventListener('submit', handleSubmit)
      fireEvent.submit(formNewBill)
      //  Vérifie que la fonction handleSubmit est bien appelée
      expect(handleSubmit).toHaveBeenCalled()
    })

    test("Then it fails with a 404 message error", async () => {

      document.body.innerHTML = BillsUI({ error: 'Erreur 404' });

      const message = await screen.getByText(/Erreur 404/);
      // Vérifie la présence du message d'erreur "Erreur 404"
      expect(message).toBeTruthy();
    })

    test("Then it fails with a 500 message error", async () => {

      document.body.innerHTML = BillsUI({ error: 'Erreur 500' });

      const message = await screen.getByText(/Erreur 500/);
      // Vérifie la présence du message d'erreur "Erreur 500"
      expect(message).toBeTruthy();
    })
  })
})