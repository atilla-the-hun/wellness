# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

When a user makes a booking for a treatment the booking is made whether the user has paid or not. Can you add a feature where the booking is added only if the user has paid 50 percent of the treatment via paypal or the full amount via paypal. Refuse a booking if no payment is made. If the user has paid 50 percent, the booking is added, but there's a button that appears next to the appointment that has a label that say's "Pay Balance" When the user clicks on the button, it shows the PayPal button to pay the outstanding balance for the appointment. The information whether the appointment was paid in full or 50 percent of the appointment should appear on the admin dashboard in All Bookings as one of the entries under the booking it applies to. And if the user paid 50 percent and then later pays the balance this should be reflected in the admin dashboard in the booking it applies to.
