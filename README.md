## Setup and Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Raiyan27/dynamic-micro-dbms.git
    cd dynamic-micro-dbms
    ```

2.  **Install dependencies:**
    Make sure you have Node.js and npm installed.

    ```bash
    npm install
    ```

    This will install necessary packages.

3.  **Run the development server:**

    ```bash
    npm run dev
    ```

    This will usually open the application in your default browser at `http://localhost:3000`.

4.  **First Run & Dummy Data:**
    - On the very first run (or after clearing localStorage for this site), the application will automatically populate itself with a few dummy employee records and their corresponding payroll data.
    - To see this in action, ensure your browser's localStorage for `localhost:3000` (or wherever the app is served) is empty before the first `npm run dev`. You can clear localStorage via your browser's developer tools (Application/Storage tab).
    - If localStorage keys `EmployeeData` or `PayrollData` exist (even if they point to an empty array `[]`), dummy data will _not_ be generated.

## Approach and Design Choices

- **Client-Side Focus:** The primary goal was to build a dynamic and interactive frontend experience. Data management is handled entirely on the client-side using `localStorage` to simulate a backend. This allows for rapid prototyping and focuses on UI/UX for data manipulation.
- **Schema-Driven UI:** Both employee profiles and payroll structures are defined by schemas in `api.js`. Modals and tables dynamically render fields based on these schemas. This makes it easier to modify fields by changing the schema definition.
- **Component Reusability:** Common UI elements like tables (`DynamicTable`), modals (`ColumnTogglerModal`, form modals), and display components (`StatsDisplay`, `StatusBadge`) are designed to be reusable across different parts of the application.
- **State Management:** React's built-in state (`useState`) and context (`useMemo`, `useEffect`) are used for managing component-level and page-level state. For a larger application, a more robust state management library (like Redux, Zustand, or Jotai) would be considered.
- **Calculations:** Payroll calculations (Gross, Net, etc.) are performed in utility functions (`utils/helpers.js`) and re-triggered when relevant input data changes in the payroll modal.
- **User Experience:**
  - Modals are used for focused data entry and viewing.
  - Pagination and search enhance usability for larger datasets.
  - Visual cues like status badges and icons improve clarity.
  - The mandatory payroll setup flow for new employees ensures data completeness.
  - Charts in the payroll detail view offer quick visual insights.
- **Modularity:** The codebase is broken down into logical units (pages, components, modals, utils, api) to improve organization and make it easier to navigate and maintain.

<!-- ## Future Enhancements (Potential)

- **Backend Integration:** Replace `localStorage` with a proper backend API and database for persistent, multi-user data storage.
- **Authentication & Authorization:** Implement user login and role-based access control.
- **Advanced Dynamic Schema Management:** Allow users to add/remove/modify fields in the schema _directly from the UI_, persisting these schema changes.
- **More Robust Validation:** Implement more complex validation rules and server-side validation.
- **Reporting & Exporting:** Add features to generate reports or export data (e.g., to CSV, PDF).
- **Testing:** Introduce unit and integration tests.
- **Accessibility (a11y):** Further improve accessibility compliance.
- **Internationalization (i18n):** Support for multiple languages. -->

---
