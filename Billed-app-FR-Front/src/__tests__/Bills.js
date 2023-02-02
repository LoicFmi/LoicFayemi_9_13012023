/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import userEvent from '@testing-library/user-event';
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { bills } from "../fixtures/bills.js";
import BillsUI from "../views/BillsUI.js";
import Bills from '../containers/Bills.js';
import router from "../app/Router.js";
import mockStore from "../__mocks__/store";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      // Création page Bills
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      // Vérifie la présence de la classe qui permet la surbrillance de l'icône
      expect(windowIcon.classList).toContain('active-icon');
    })

    test("Then bills should be ordered from earliest to latest", () => {

      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      // Vérifie que les dates sont triées par ordre décroissant
      expect(dates).toEqual(datesSorted)
    })
  })

  describe("When I click on the New Bill button", () => {
    test("Then I should be sent to the New Bill page", () => {

      // Création page Bills
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      // Initie la page Bills
      const billsContainer = new Bills({
        document,
        onNavigate,
        localStorage: window.localStorage,
      });

      const handleClickNewBill = jest.fn(billsContainer.handleClickNewBill);
      const newBillButton = screen.getByTestId('btn-new-bill');
      newBillButton.addEventListener('click', handleClickNewBill);
      userEvent.click(newBillButton);
      //  Vérifie que la fonction handleClickNewBill est bien appelée
      expect(handleClickNewBill).toHaveBeenCalled();
      //  Vérifie que la page de création de nouvelle note de frais à bien été affichée
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy();
    })
  })

  describe("When I click on the Eye icon", () => {
    test("Then a modal should open", () => {

      // Création page Bills
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      // Initie la page Bills
      const billsContainer = new Bills({
        document,
        onNavigate,
        localStorage: window.localStorage,
      });

      $.fn.modal = jest.fn();
      const icon = screen.getAllByTestId('icon-eye')[0];
      const handleClickIconEye = jest.fn(() =>
        billsContainer.handleClickIconEye(icon)
      );
      icon.addEventListener('click', handleClickIconEye);
      userEvent.click(icon);
      //  Vérifie que la fonction handleClickIconEye est bien appelée
      expect(handleClickIconEye).toHaveBeenCalled();
    })
  })
})


// Test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills page", () => {
    test("fetches bills from mock API GET", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      const bills = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage
      })
      bills.getBills().then(data => {
        root.innerHTML = BillsUI({ data })
        expect(document.querySelector('tbody').rows.length).toBeGreaterThan(0)
      })
    })

    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: "a@a"
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })

      test("fetches bills from an API and fails with 404 message error", async () => {

        document.body.innerHTML = BillsUI({ error: 'Erreur 404' });

        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })

      test("fetches messages from an API and fails with 500 message error", async () => {

        document.body.innerHTML = BillsUI({ error: 'Erreur 500' });

        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
  })
})