import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const PractitionerSearch = () => {
  const { aToken, appointments, getAllAppointments } = useContext(AdminContext)
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext)
  const [practitioner, setPractitioner] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [totalInvoices, setTotalInvoices] = useState(0)
  const [practitioners, setPractitioners] = useState([])

  // Function to handle printing
  const handlePrint = () => {
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <style>
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; }
        .header { margin-bottom: 20px; }
        .totals { margin-bottom: 20px; }
        @media print {
          body { padding: 20px; }
        }
      </style>
      <div class="header">
        <h1>Wellness & Aesthetics - Practitioner Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
        <p>Practitioner: ${practitioner}</p>
        <p>Period: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}</p>
      </div>
      <div class="totals">
        <p>Total Bookings: ${currency} ${totalInvoices}</p>
        <p>Total Received: ${currency} ${totalEarnings}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Client Name</th>
            <th>Treatment</th>
            <th>Date & Time</th>
            <th>Amount</th>
            <th>Paid Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${filteredAppointments.map(item => `
            <tr>
              <td>${item.userData.name}</td>
              <td>${item.docData.name}</td>
              <td>${slotDateFormat(item.slotDate)} ${item.slotTime}</td>
              <td>${currency}${item.amount}</td>
              <td>${currency}${item.paidAmount || 0}</td>
              <td>${item.cancelled ? 'Cancelled' : item.isCompleted ? 'Completed' : 'Active'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.close();
    printWindow.print();
  };

  // Function to handle download
  const handleDownload = () => {
    const headers = [
      'Client Name',
      'Client Email',
      'Client Phone',
      'Treatment',
      'Date',
      'Time',
      'Amount',
      'Paid Amount',
      'Payment Status',
      'Appointment Status'
    ];

    const csvData = filteredAppointments.map(item => [
      item.userData.name,
      item.userData.email,
      item.userData.phone,
      item.docData.name,
      slotDateFormat(item.slotDate),
      item.slotTime,
      `${currency}${item.amount}`,
      `${currency}${item.paidAmount || 0}`,
      item.paymentStatus,
      item.cancelled ? 'Cancelled' : item.isCompleted ? 'Completed' : 'Active'
    ]);

    const csvContent = [
      headers,
      ...csvData
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `practitioner_report_${practitioner}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (aToken) {
      getAllAppointments()
    }
  }, [aToken])

  useEffect(() => {
    if (appointments) {
      const uniquePractitioners = [...new Set(appointments.map(appointment => appointment.practitioner))]
      setPractitioners(uniquePractitioners)
    }
  }, [appointments])

  const handleSearch = () => {
    if (appointments && practitioner && startDate && endDate) {
      const filtered = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.slotDate.split('_').reverse().join('-'))
        const start = new Date(startDate)
        const end = new Date(endDate)
        return appointment.practitioner === practitioner && 
               appointmentDate >= start && 
               appointmentDate <= end
      })
      setFilteredAppointments(filtered)
      const earnings = filtered.reduce((total, appointment) => {
        const paidAmount = parseFloat(appointment.paidAmount || 0)
        return isNaN(paidAmount) ? total : total + paidAmount
      }, 0)
      const invoices = filtered.reduce((total, appointment) => {
        const totalAmount = parseFloat(appointment.amount || 0)
        return isNaN(totalAmount) ? total : total + totalAmount
      }, 0)
      setTotalEarnings(earnings)
      setTotalInvoices(invoices)
    } else {
      setFilteredAppointments([])
      setTotalEarnings(0)
      setTotalInvoices(0)
    }
  }

  // Function to get payment status display
  const getPaymentStatusDisplay = (appointment) => {
    const paidAmount = appointment.paidAmount || 0;
    const totalAmount = appointment.amount || 0;
    const remainingBalance = totalAmount - paidAmount;

    if (appointment.paymentStatus === 'full') {
      return {
        text: 'Paid in Full',
        color: 'text-green-500',
        paidAmount: totalAmount,
        remainingBalance: 0
      }
    } else if (appointment.paymentStatus === 'partial') {
      return {
        text: '50% Paid',
        color: 'text-orange-500',
        paidAmount: paidAmount,
        remainingBalance: remainingBalance
      }
    } else {
      return {
        text: 'Unpaid',
        color: 'text-red-500',
        paidAmount: 0,
        remainingBalance: totalAmount
      }
    }
  }

  // Function to format payment history
  const formatPaymentHistory = (transactionDetails) => {
    if (!transactionDetails || transactionDetails.length === 0) return 'No payments recorded'
    
    return transactionDetails.map((transaction, index) => (
      <div key={index} className='text-xs mt-1'>
        <span className='text-gray-600'>
          {new Date(transaction.date).toLocaleDateString()} - {currency}{transaction.amount} 
          ({transaction.paymentType === 'full' ? 'Full Payment' : 'Partial Payment'})
        </span>
      </div>
    ))
  }

  return (
    <div className='w-58 max-w-4xl m-5 sm:w-[500px]'>
      <p className='mb-3 text-lg font-medium'>Practitioner Search</p>
      <div className='bg-white p-4 rounded border'>
        <h2 className='text-lg font-medium mb-4'>Filter Appointments</h2>
        <div className='flex flex-col gap-4'>
          <div>
            <label>Practitioner</label>
            <select value={practitioner} onChange={e => setPractitioner(e.target.value)} className='border rounded px-2 py-1 w-full'>
              <option value=''>Select Practitioner</option>
              {practitioners.map((practitioner, index) => (
                <option key={index} value={practitioner}>{practitioner}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Start Date</label>
            <input type='date' value={startDate} onChange={e => setStartDate(e.target.value)} className='border rounded px-2 py-1 w-full' />
          </div>
          <div>
            <label>End Date</label>
            <input type='date' value={endDate} onChange={e => setEndDate(e.target.value)} className='border rounded px-2 py-1 w-full' />
          </div>
          <div>
            <button onClick={handleSearch} className='bg-primary text-white px-4 py-2 rounded w-full'>Search</button>
          </div>
        </div>
      </div>
      <div className='bg-white mt-5 p-4 rounded border'>
        <h2 className='text-lg font-medium mb-4'>Filtered Appointments</h2>
        <div>
          <p className='text-xl font-semibold'>Total Bookings: {currency} {totalInvoices}</p>
          <p className='text-xl font-semibold mt-2'>Received: {currency} {totalEarnings}</p>
          <div className='flex flex-col gap-2 mt-4'>
            <button
              onClick={handlePrint}
              className='w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all flex items-center justify-center gap-2'
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button
              onClick={handleDownload}
              className='w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-all flex items-center justify-center gap-2'
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          </div>
        </div>
        <div className='pt-4 border border-t-0'>
          {filteredAppointments.map((item, index) => {
            const paymentStatusStyle = getPaymentStatusDisplay(item)
            return (
              <div className='flex items-center px-6 py-3 gap-3 hover:bg-gray-100' key={index}>
                <div className='flex-1 text-sm'>
                  <div className='flex justify-between items-start'>
                    <div>
                      <p className={`px-2 py-1 rounded-full ${paymentStatusStyle.color}`}>
                        {paymentStatusStyle.text}
                      </p>
                      <p className='text-gray-800 font-medium'>{item.docData.name}</p>
                      <p className='text-gray-600'>Practitioner: {item.practitioner}</p>
                      <p className='text-gray-600'>Client: {item.userData.name}</p>
                      <p className='text-gray-600'>Date & Time: {slotDateFormat(item.slotDate)}, {item.slotTime}</p>
                      <p className='text-gray-600'>Fees: {currency} {item.amount}</p>
                    </div>
                  </div>

                  <div className='mt-4 grid grid-cols-1 gap-4'>
                    <div>
                      <img className='rounded-full w-20' src={item.userData.image} alt="" />
                      <p className='text-gray-600'>Client Name: {item.userData.name}</p>
                      <p className='text-gray-600'>Client Email: {item.userData.email}</p>
                      <p className='text-gray-600'>Client Telephone: {item.userData.phone}</p>
                      <p className='text-gray-600'>Client Age: {calculateAge(item.userData.dob)}</p>
                      <p className='text-gray-600 font-medium'>Payment History:</p>
                      {formatPaymentHistory(item.transactionDetails)}
                      {paymentStatusStyle.remainingBalance > 0 && (
                        <p className='text-gray-600 mt-2'>
                          Remaining Balance: {currency}{paymentStatusStyle.remainingBalance.toFixed(2)}
                        </p>
                      )}
                      <p className='text-gray-600 mt-1'>
                        Paid: {currency}{paymentStatusStyle.paidAmount.toFixed(2)} / 
                        Total: {currency}{item.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default PractitionerSearch
