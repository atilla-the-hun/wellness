import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import AdminLayout from './components/AdminLayout'
import TreatmentLayout from './components/TreatmentLayout'
import Dashboard from './pages/Admin/Dashboard'
import TreatmentDashboard from './pages/Treatment/TreatmentDashboard'
import TreatmentProfile from './pages/Treatment/TreatmentProfile'
import TreatmentAppointments from './pages/Treatment/TreatmentAppointments'
import TreatmentsList from './pages/Admin/TreatmentsList'
import AddTreatment from './pages/Admin/AddTreatment'
import EditTreatment from './pages/Admin/EditTreatment'
import ManageAppointments from './pages/Admin/ManageAppointments'
import AllAppointments from './pages/Admin/AllAppointments'
import PractitionerSearch from './pages/Admin/PractitionerSearch'
import ManageGallery from './pages/Admin/ManageGallery'
import ManageTeam from './pages/Admin/ManageTeam'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/admin' element={<AdminLayout />}>
          <Route path='dashboard' element={<Dashboard />} />
          <Route path='treatments' element={<TreatmentsList />} />
          <Route path='add-treatment' element={<AddTreatment />} />
          <Route path='edit-treatment/:id' element={<EditTreatment />} />
          <Route path='manage-appointments' element={<ManageAppointments />} />
          <Route path='all-appointments' element={<AllAppointments />} />
          <Route path='practitioner-search' element={<PractitionerSearch />} />
          <Route path='manage-gallery' element={<ManageGallery />} />
          <Route path='manage-team' element={<ManageTeam />} />
        </Route>
        <Route path='/treatment' element={<TreatmentLayout />}>
          <Route path='dashboard' element={<TreatmentDashboard />} />
          <Route path='profile' element={<TreatmentProfile />} />
          <Route path='appointments' element={<TreatmentAppointments />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
