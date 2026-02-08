import React, { useState, useEffect } from 'react';
import { 
  User, Lock, Mail, LogOut, Plus, Search, Filter, Download,
  TrendingUp, TrendingDown, DollarSign, FileText, Users, Calendar,
  Edit2, Trash2, Eye, X, Save, Receipt, PieChart, BarChart3, Settings,
  Printer, Send, FileDown, ChevronUp, ChevronDown, ArrowUpDown,
  HelpCircle, Menu
} from 'lucide-react';
import './storage-polyfill.js';

const BookkeeperApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ 
    name: '', email: '', password: '', confirmPassword: '', business: '' 
  });
  
  // Data states
  const [invoices, setInvoices] = useState([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [companyProfile, setCompanyProfile] = useState({
    name: '',
    regNumber: '',
    vatNumber: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phone: '',
    email: '',
    bankName: '',
    bankAccount: '',
    website: ''
  });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedPurchaseInvoice, setSelectedPurchaseInvoice] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isValidApiBaseUrl = (url) => {
    const u = (url || '').trim();
    if (!u) return false;
    if (u.startsWith('postgresql://') || u.startsWith('postgres://')) return false;
    if (!u.startsWith('http://') && !u.startsWith('https://')) return false;
    return true;
  };

  const [apiBaseUrl, setApiBaseUrl] = useState(() => {
    try {
      const stored = localStorage.getItem('bookkeeper_api_base_url') || import.meta.env.VITE_API_URL || '';
      if (!isValidApiBaseUrl(stored)) {
        if (stored) try { localStorage.removeItem('bookkeeper_api_base_url'); } catch (_) {}
        return import.meta.env.VITE_API_URL || '';
      }
      return stored;
    } catch { return import.meta.env.VITE_API_URL || ''; }
  });
  const [lastNeonSave, setLastNeonSave] = useState(() => {
    try { return localStorage.getItem('bookkeeper_neon_last_save') || null; } catch { return null; }
  });
  const [neonBusy, setNeonBusy] = useState(false);

  // Demo user data
  const setupDemoUser = () => {
    const demoUser = {
      name: 'Demo User',
      email: 'demo@bookkeeper.app',
      password: 'demo',
      business: 'Demo Business Inc.',
      createdAt: new Date().toISOString()
    };

    const demoCompanyProfile = {
      name: 'Demo Business Inc.',
      regNumber: '12345678',
      vatNumber: 'EE123456789',
      address: '123 Business Street',
      city: 'Tallinn',
      postalCode: '10115',
      country: 'Estonia',
      phone: '+372 5555 1234',
      email: 'info@demobusiness.ee',
      bankName: 'SEB Bank',
      bankAccount: 'EE381234567890123456',
      website: 'www.demobusiness.ee'
    };

    const demoInvoices = [
      {
        id: '1',
        number: 'INV-2026-001',
        clientName: 'Acme Corporation',
        clientEmail: 'contact@acme.com',
        date: '2026-01-15',
        dueDate: '2026-02-15',
        items: [
          { description: 'Web Development Services', quantity: 40, price: 75 },
          { description: 'UI/UX Design', quantity: 20, price: 85 }
        ],
        includeVat: true,
        vatRate: 22,
        subtotal: '4700.00',
        vatAmount: '1034.00',
        total: '5734.00',
        status: 'paid',
        userId: demoUser.email,
        createdAt: '2026-01-15T10:00:00Z'
      },
      {
        id: '2',
        number: 'INV-2026-002',
        clientName: 'Tech Startup Ltd',
        clientEmail: 'hello@techstartup.io',
        date: '2026-01-28',
        dueDate: '2026-02-28',
        items: [
          { description: 'Monthly Consulting', quantity: 1, price: 3500 },
          { description: 'Technical Support', quantity: 10, price: 120 }
        ],
        includeVat: true,
        vatRate: 22,
        subtotal: '4700.00',
        vatAmount: '1034.00',
        total: '5734.00',
        status: 'pending',
        userId: demoUser.email,
        createdAt: '2026-01-28T14:30:00Z'
      },
      {
        id: '3',
        number: 'INV-2026-003',
        clientName: 'Global Solutions Inc',
        clientEmail: 'billing@globalsolutions.com',
        date: '2026-02-01',
        dueDate: '2026-03-01',
        items: [
          { description: 'E-commerce Platform Development', quantity: 60, price: 90 }
        ],
        includeVat: true,
        vatRate: 20,
        subtotal: '5400.00',
        vatAmount: '1080.00',
        total: '6480.00',
        status: 'paid',
        userId: demoUser.email,
        createdAt: '2026-02-01T09:15:00Z'
      }
    ];

    const demoPurchaseInvoices = [
      {
        id: '1',
        number: 'PINV-2026-001',
        supplierName: 'Office Supplies Co.',
        date: '2026-01-10',
        dueDate: '2026-02-10',
        items: [
          { description: 'Office furniture', quantity: 2, price: 450 },
          { description: 'Printer paper (box)', quantity: 5, price: 25 }
        ],
        includeVat: true,
        vatRate: 22,
        subtotal: '1025.00',
        vatAmount: '225.50',
        total: '1250.50',
        status: 'paid',
        userId: demoUser.email,
        createdAt: '2026-01-10T11:00:00Z'
      },
      {
        id: '2',
        number: 'PINV-2026-002',
        supplierName: 'Software Solutions Ltd',
        date: '2026-01-15',
        dueDate: '2026-02-15',
        items: [
          { description: 'Adobe Creative Cloud - Annual', quantity: 1, price: 659.88 }
        ],
        includeVat: true,
        vatRate: 22,
        subtotal: '659.88',
        vatAmount: '145.17',
        total: '805.05',
        status: 'paid',
        userId: demoUser.email,
        createdAt: '2026-01-15T08:00:00Z'
      },
      {
        id: '3',
        number: 'PINV-2026-003',
        supplierName: 'Cloud Hosting Services',
        date: '2026-02-01',
        dueDate: '2026-03-01',
        items: [
          { description: 'Web Hosting - Annual', quantity: 1, price: 180 },
          { description: 'SSL Certificate', quantity: 1, price: 50 }
        ],
        includeVat: true,
        vatRate: 22,
        subtotal: '230.00',
        vatAmount: '50.60',
        total: '280.60',
        status: 'pending',
        userId: demoUser.email,
        createdAt: '2026-02-01T10:00:00Z'
      }
    ];

    const demoClients = [
      {
        id: '1',
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        phone: '+1 555-0101',
        address: '123 Business St, New York, NY 10001',
        regNumber: 'US-12345678',
        vatNumber: '',
        active: true,
        userId: demoUser.email,
        createdAt: '2026-01-01T09:00:00Z'
      },
      {
        id: '2',
        name: 'Tech Startup Ltd',
        email: 'hello@techstartup.io',
        phone: '+1 555-0202',
        address: '456 Innovation Ave, San Francisco, CA 94102',
        regNumber: 'US-23456789',
        vatNumber: '',
        active: true,
        userId: demoUser.email,
        createdAt: '2026-01-05T10:30:00Z'
      },
      {
        id: '3',
        name: 'Global Solutions Inc',
        email: 'billing@globalsolutions.com',
        phone: '+1 555-0303',
        address: '789 Enterprise Blvd, Austin, TX 78701',
        regNumber: 'US-34567890',
        vatNumber: '',
        active: true,
        userId: demoUser.email,
        createdAt: '2026-01-10T14:00:00Z'
      }
    ];

    return { demoUser, demoCompanyProfile, demoInvoices, demoPurchaseInvoices, demoClients };
  };

  // Initialize data from storage
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await window.storage.get('current_user');
        if (userData && userData.value) {
          const user = JSON.parse(userData.value);
          setCurrentUser(user);
          setIsLoggedIn(true);
          await loadUserData(user.email);
        }
      } catch (error) {
        console.log('No active session');
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const loadUserData = async (userEmail) => {
    const base = (apiBaseUrl || import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
    if (base && isValidApiBaseUrl(base) && userEmail !== 'demo@bookkeeper.app') {
      try {
        setNeonBusy(true);
        const res = await fetch(`${base}/api/data?userId=${encodeURIComponent(userEmail)}`);
        if (!res.ok) throw new Error(res.status === 503 ? 'Database not configured' : await res.text());
        const data = await res.json();
        setInvoices(Array.isArray(data.invoices) ? data.invoices : []);
        setPurchaseInvoices(Array.isArray(data.purchaseInvoices) ? data.purchaseInvoices : []);
        setClients(Array.isArray(data.clients) ? data.clients : []);
        setCompanyProfile(data.companyProfile && typeof data.companyProfile === 'object' ? data.companyProfile : { name: '', regNumber: '', vatNumber: '', address: '', city: '', postalCode: '', country: '', phone: '', email: '', bankName: '', bankAccount: '', website: '' });
      } catch (error) {
        console.error('Error loading from Neon:', error);
        alert('Could not load from database: ' + (error.message || 'Unknown error'));
      } finally {
        setNeonBusy(false);
      }
      return;
    }
    try {
      const userKey = `user_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const [invoicesData, purchaseInvoicesData, clientsData, companyData] = await Promise.all([
        window.storage.get(`${userKey}_invoices`).catch(() => null),
        window.storage.get(`${userKey}_purchase_invoices`).catch(() => null),
        window.storage.get(`${userKey}_clients`).catch(() => null),
        window.storage.get(`${userKey}_company`).catch(() => null)
      ]);
      if (invoicesData?.value) setInvoices(JSON.parse(invoicesData.value));
      if (purchaseInvoicesData?.value) setPurchaseInvoices(JSON.parse(purchaseInvoicesData.value));
      if (clientsData?.value) setClients(JSON.parse(clientsData.value));
      if (companyData?.value) setCompanyProfile(JSON.parse(companyData.value));
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const saveUserData = async (dataType, data) => {
    if (!currentUser) return;
    if (currentUser.email === 'demo@bookkeeper.app') return;

    const base = (apiBaseUrl || import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
    if (base && isValidApiBaseUrl(base)) {
      try {
        setNeonBusy(true);
        const payload = {
          userId: currentUser.email,
          invoices: dataType === 'invoices' ? data : invoices,
          purchaseInvoices: dataType === 'purchase_invoices' ? data : purchaseInvoices,
          clients: dataType === 'clients' ? data : clients,
          companyProfile: dataType === 'company' ? data : companyProfile
        };
        const res = await fetch(`${base}/api/data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
        const when = new Date().toISOString();
        setLastNeonSave(when);
        try { localStorage.setItem('bookkeeper_neon_last_save', when); } catch (_) {}
      } catch (error) {
        console.error('Error saving to Neon:', error);
        alert('Could not save to database: ' + (error.message || 'Unknown error'));
      } finally {
        setNeonBusy(false);
      }
      return;
    }
    try {
      const userKey = `user_${currentUser.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
      await window.storage.set(`${userKey}_${dataType}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Check for demo user
      if (loginForm.email === 'demo@bookkeeper.app' && loginForm.password === 'demo') {
        const { demoUser, demoCompanyProfile, demoInvoices, demoPurchaseInvoices, demoClients } = setupDemoUser();
        setCurrentUser(demoUser);
        setIsLoggedIn(true);
        setCompanyProfile(demoCompanyProfile);
        setInvoices(demoInvoices);
        setPurchaseInvoices(demoPurchaseInvoices);
        setClients(demoClients);
        await window.storage.set('current_user', JSON.stringify(demoUser));
        setLoginForm({ email: '', password: '' });
        return;
      }

      const userKey = `auth_${loginForm.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const userData = await window.storage.get(userKey);
      
      if (userData?.value) {
        const user = JSON.parse(userData.value);
        if (user.password === loginForm.password) {
          setCurrentUser(user);
          setIsLoggedIn(true);
          await window.storage.set('current_user', JSON.stringify(user));
          await loadUserData(user.email);
          setLoginForm({ email: '', password: '' });
        } else {
          alert('Invalid password');
        }
      } else {
        alert('User not found');
      }
    } catch (error) {
      alert('Login failed. Please try again.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (registerForm.password !== registerForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const userKey = `auth_${registerForm.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
      
      // Check if user already exists
      const existingUser = await window.storage.get(userKey).catch(() => null);
      if (existingUser) {
        alert('User already exists');
        return;
      }

      const newUser = {
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        business: registerForm.business,
        createdAt: new Date().toISOString()
      };

      await window.storage.set(userKey, JSON.stringify(newUser));
      setCurrentUser(newUser);
      setIsLoggedIn(true);
      await window.storage.set('current_user', JSON.stringify(newUser));
      setRegisterForm({ name: '', email: '', password: '', confirmPassword: '', business: '' });
    } catch (error) {
      alert('Registration failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await window.storage.delete('current_user');
    } catch (error) {
      console.log('Error clearing session');
    }
    setIsLoggedIn(false);
    setCurrentUser(null);
    setInvoices([]);
    setPurchaseInvoices([]);
    setClients([]);
    setCompanyProfile({
      name: '', regNumber: '', vatNumber: '', address: '', city: '', 
      postalCode: '', country: '', phone: '', email: '', bankName: '', 
      bankAccount: '', website: ''
    });
    setActiveTab('dashboard');
  };

  const addInvoice = async (invoice) => {
    const newInvoice = {
      ...invoice,
      id: Date.now().toString(),
      userId: currentUser.email,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    const updated = [...invoices, newInvoice];
    setInvoices(updated);
    await saveUserData('invoices', updated);
  };

  const updateInvoice = async (id, updates) => {
    const updated = invoices.map(inv => inv.id === id ? { ...inv, ...updates } : inv);
    setInvoices(updated);
    await saveUserData('invoices', updated);
  };

  const deleteInvoice = async (id) => {
    const updated = invoices.filter(inv => inv.id !== id);
    setInvoices(updated);
    await saveUserData('invoices', updated);
  };

  const addPurchaseInvoice = async (invoice) => {
    const newInvoice = {
      ...invoice,
      id: Date.now().toString(),
      userId: currentUser.email,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    const updated = [...purchaseInvoices, newInvoice];
    setPurchaseInvoices(updated);
    await saveUserData('purchase_invoices', updated);
  };

  const updatePurchaseInvoice = async (id, updates) => {
    const updated = purchaseInvoices.map(inv => inv.id === id ? { ...inv, ...updates } : inv);
    setPurchaseInvoices(updated);
    await saveUserData('purchase_invoices', updated);
  };

  const deletePurchaseInvoice = async (id) => {
    const updated = purchaseInvoices.filter(inv => inv.id !== id);
    setPurchaseInvoices(updated);
    await saveUserData('purchase_invoices', updated);
  };

  const saveCompanyProfile = async (profileData) => {
    setCompanyProfile(profileData);
    await saveUserData('company', profileData);
  };

  // Generate invoice as HTML string (used for print and email attachment)
  const getInvoiceHtml = (invoice) => {
    const vatAmount = invoice.vatAmount || 0;
    const subtotal = invoice.subtotal || invoice.total;
    return `<!DOCTYPE html>
<html>
  <head>
    <title>Invoice ${invoice.number}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
      .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
      .company-info { flex: 1; }
      .invoice-info { text-align: right; }
      .invoice-title { font-size: 32px; font-weight: bold; color: #333; margin-bottom: 10px; }
      .company-name { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
      .info-line { margin: 3px 0; font-size: 14px; color: #555; }
      .section-title { font-weight: bold; margin: 30px 0 10px 0; font-size: 16px; color: #333; }
      .bill-to { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
      table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      th { background: #333; color: white; padding: 12px; text-align: left; font-weight: bold; }
      td { padding: 10px; border-bottom: 1px solid #ddd; }
      .amount { text-align: right; }
      .totals { margin-top: 30px; float: right; width: 300px; }
      .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
      .total-row.final { border-top: 2px solid #333; margin-top: 10px; padding-top: 15px; font-size: 18px; font-weight: bold; }
      .notes { clear: both; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; }
      .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #ddd; padding-top: 20px; }
      @media print { body { padding: 20px; } .no-print { display: none; } }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="company-info">
        <div class="company-name">${companyProfile.name || currentUser.business || 'Your Company'}</div>
        ${companyProfile.regNumber ? `<div class="info-line">Reg. No: ${companyProfile.regNumber}</div>` : ''}
        ${companyProfile.vatNumber ? `<div class="info-line">VAT No: ${companyProfile.vatNumber}</div>` : ''}
        ${companyProfile.address ? `<div class="info-line">${companyProfile.address}</div>` : ''}
        ${companyProfile.city && companyProfile.postalCode ? `<div class="info-line">${companyProfile.postalCode} ${companyProfile.city}</div>` : ''}
        ${companyProfile.country ? `<div class="info-line">${companyProfile.country}</div>` : ''}
        ${companyProfile.phone ? `<div class="info-line">Tel: ${companyProfile.phone}</div>` : ''}
        ${companyProfile.email ? `<div class="info-line">Email: ${companyProfile.email}</div>` : ''}
      </div>
      <div class="invoice-info">
        <div class="invoice-title">INVOICE</div>
        <div class="info-line"><strong>Invoice #:</strong> ${invoice.number}</div>
        <div class="info-line"><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</div>
        ${invoice.dueDate ? `<div class="info-line"><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</div>` : ''}
        <div class="info-line" style="margin-top: 10px; color: ${invoice.status === 'paid' ? '#10b981' : '#f59e0b'}; font-weight: bold;">Status: ${invoice.status.toUpperCase()}</div>
      </div>
    </div>
    <div class="bill-to">
      <div class="section-title">Bill To:</div>
      <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">${invoice.clientName}</div>
      ${invoice.clientEmail ? `<div class="info-line">${invoice.clientEmail}</div>` : ''}
    </div>
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="width: 80px; text-align: center;">Quantity</th>
          <th style="width: 100px; text-align: right;">Unit Price</th>
          <th style="width: 100px; text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.items.map(item => `
          <tr>
            <td>${item.description}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td class="amount">€${parseFloat(item.price).toFixed(2)}</td>
            <td class="amount">€${(item.quantity * item.price).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="totals">
      <div class="total-row"><span>Subtotal:</span><span>€${parseFloat(subtotal).toFixed(2)}</span></div>
      ${invoice.includeVat ? `<div class="total-row"><span>VAT (${invoice.vatRate}%):</span><span>€${parseFloat(vatAmount).toFixed(2)}</span></div>` : ''}
      <div class="total-row final"><span>Total:</span><span>€${parseFloat(invoice.total).toFixed(2)}</span></div>
    </div>
    ${invoice.notes ? `<div class="notes"><div class="section-title">Notes:</div><div class="info-line">${invoice.notes.replace(/\n/g, '<br>')}</div></div>` : ''}
    <div class="footer">
      ${companyProfile.bankName || companyProfile.bankAccount ? `<div style="margin-bottom: 10px;"><strong>Banking Details:</strong><br>${companyProfile.bankName ? `${companyProfile.bankName}<br>` : ''}${companyProfile.bankAccount ? `Account: ${companyProfile.bankAccount}` : ''}</div>` : ''}
      <div>Thank you for your business!</div>
    </div>
    <div class="no-print" style="margin-top: 30px; text-align: center;">
      <button onclick="window.print()" style="padding: 10px 30px; font-size: 16px; cursor: pointer; background: #667eea; color: white; border: none; border-radius: 5px;">Print Invoice</button>
      <button onclick="window.close()" style="padding: 10px 30px; font-size: 16px; cursor: pointer; background: #6b7280; color: white; border: none; border-radius: 5px; margin-left: 10px;">Close</button>
    </div>
  </body>
</html>`;
  };

  const printInvoice = (invoice) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(getInvoiceHtml(invoice));
    printWindow.document.close();
  };

  const downloadInvoiceAttachment = (invoice) => {
    const html = getInvoiceHtml(invoice);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${invoice.number.replace(/[^a-zA-Z0-9.-]/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  // Generate invoice as XML string (e-Arve / e-Invoice format)
  const getInvoiceXML = (invoice) => {
    const escapeXML = (str) => {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };
    const client = clients.find(c => c.name === invoice.clientName) || {};
    const formatDate = (dateStr) => new Date(dateStr).toISOString().split('T')[0];
    const subtotal = parseFloat(invoice.subtotal || invoice.total);
    const vatAmount = parseFloat(invoice.vatAmount || 0);
    const total = parseFloat(invoice.total);
    const vatRate = parseFloat(invoice.vatRate || 0);
    return `<?xml version="1.0" encoding="UTF-8"?>
<E_Invoice xsi:schemaLocation="http://e-arve.ee/XMLSchema/e-invoice/v1.2" xmlns="http://e-arve.ee" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <Header>
    <Date>${formatDate(invoice.date)}</Date>
    <FileId>${invoice.number.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}</FileId>
    <Version>1.2</Version>
  </Header>
  <Invoice invoiceId="${invoice.number}" regNumber="${companyProfile.regNumber || ''}" sellerRegnumber="${companyProfile.regNumber || ''}">
    <InvoiceParties>
      <SellerParty>
        <Name>${escapeXML(companyProfile.name || currentUser.business || 'Your Company')}</Name>
        <RegNumber>${companyProfile.regNumber || ''}</RegNumber>
        <VATRegNumber>${companyProfile.vatNumber || ''}</VATRegNumber>
        <ContactData>
          <LegalAddress>
            <PostalAddress1>${escapeXML(companyProfile.address || '')}</PostalAddress1>
            <City>${escapeXML(companyProfile.city || '')}</City>
            <PostalCode>${companyProfile.postalCode || ''}</PostalCode>
            <Country>${companyProfile.country || 'EE'}</Country>
          </LegalAddress>
          <PhoneNumber>${companyProfile.phone || ''}</PhoneNumber>
          <E-mailAddress>${companyProfile.email || ''}</E-mailAddress>
        </ContactData>
        ${companyProfile.bankAccount ? `
        <AccountInfo>
          <AccountNumber>${companyProfile.bankAccount}</AccountNumber>
          <BankName>${escapeXML(companyProfile.bankName || '')}</BankName>
        </AccountInfo>` : ''}
      </SellerParty>
      <BuyerParty>
        <Name>${escapeXML(invoice.clientName)}</Name>
        ${client.regNumber ? `<RegNumber>${client.regNumber}</RegNumber>` : ''}
        ${client.vatNumber ? `<VATRegNumber>${client.vatNumber}</VATRegNumber>` : ''}
        <ContactData>
          ${client.address ? `
          <LegalAddress>
            <PostalAddress1>${escapeXML(client.address)}</PostalAddress1>
          </LegalAddress>` : ''}
          ${client.phone ? `<PhoneNumber>${client.phone}</PhoneNumber>` : ''}
          ${client.email ? `<E-mailAddress>${client.email}</E-mailAddress>` : ''}
        </ContactData>
      </BuyerParty>
    </InvoiceParties>
    <InvoiceInformation>
      <Type type="DEB">Invoice</Type>
      <DocumentName>Invoice</DocumentName>
      <InvoiceNumber>${invoice.number}</InvoiceNumber>
      <InvoiceDate>${formatDate(invoice.date)}</InvoiceDate>
      ${invoice.dueDate ? `<DueDate>${formatDate(invoice.dueDate)}</DueDate>` : ''}
      <InvoiceCurrency>EUR</InvoiceCurrency>
    </InvoiceInformation>
    <InvoiceSumGroup>
      <InvoiceSum>${total.toFixed(2)}</InvoiceSum>
      <TotalVATSum>${vatAmount.toFixed(2)}</TotalVATSum>
      <TotalSum>${total.toFixed(2)}</TotalSum>
      <Currency>EUR</Currency>
    </InvoiceSumGroup>
    <InvoiceItem>
${invoice.items.map((item, index) => {
      const itemSubtotal = parseFloat(item.quantity) * parseFloat(item.price);
      const itemVAT = invoice.includeVat ? itemSubtotal * (vatRate / 100) : 0;
      const itemTotal = itemSubtotal + itemVAT;
      return `      <InvoiceItemGroup>
        <ItemEntry>
          <RowNo>${index + 1}</RowNo>
          <Description>${escapeXML(item.description)}</Description>
          <ItemPrice>${parseFloat(item.price).toFixed(2)}</ItemPrice>
          <ItemUnit>pcs</ItemUnit>
          <ItemAmount>${parseFloat(item.quantity).toFixed(2)}</ItemAmount>
          <ItemSum>${itemSubtotal.toFixed(2)}</ItemSum>
          ${invoice.includeVat ? `
          <VAT vatId="TAX">
            <VATRate>${vatRate.toFixed(2)}</VATRate>
            <VATSum>${itemVAT.toFixed(2)}</VATSum>
          </VAT>` : ''}
          <ItemTotal>${itemTotal.toFixed(2)}</ItemTotal>
        </ItemEntry>
      </InvoiceItemGroup>`;
    }).join('\n')}
    </InvoiceItem>
    ${invoice.notes ? `
    <AdditionalInformation>
      <InformationName>Notes</InformationName>
      <InformationContent>${escapeXML(invoice.notes)}</InformationContent>
    </AdditionalInformation>` : ''}
    <PaymentInfo>
      <Currency>EUR</Currency>
      <PaymentDescription>Invoice ${invoice.number}</PaymentDescription>
      ${invoice.dueDate ? `<Payable>YES</Payable>
      <PayDueDate>${formatDate(invoice.dueDate)}</PayDueDate>` : ''}
      <PaymentTotalSum>${total.toFixed(2)}</PaymentTotalSum>
      ${companyProfile.bankAccount ? `
      <PayerAccount>${companyProfile.bankAccount}</PayerAccount>
      <PaymentId>${invoice.number.replace(/[^0-9]/g, '')}</PaymentId>` : ''}
    </PaymentInfo>
  </Invoice>
</E_Invoice>`;
  };

  const downloadInvoiceXml = (invoice) => {
    const xml = getInvoiceXML(invoice);
    const formatDate = (dateStr) => new Date(dateStr).toISOString().split('T')[0];
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${invoice.number.replace(/[^a-zA-Z0-9]/g, '_')}_${formatDate(invoice.date)}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const emailInvoice = (invoice) => {
    // Download invoice as HTML and XML so user can attach them (mailto: cannot add attachments)
    downloadInvoiceAttachment(invoice);
    downloadInvoiceXml(invoice);
    const subject = encodeURIComponent(`Invoice ${invoice.number} from ${companyProfile.name || currentUser.business || 'Your Company'}`);
    const body = encodeURIComponent(`Dear ${invoice.clientName},

Please find attached invoice ${invoice.number} dated ${new Date(invoice.date).toLocaleDateString()}:
- Invoice (HTML) – view/print or save as PDF from your browser
- e-Invoice (XML) – for accounting systems

Please attach the 2 files that were just downloaded (check your Downloads folder).

Invoice Details:
- Invoice Number: ${invoice.number}
- Date: ${new Date(invoice.date).toLocaleDateString()}
${invoice.dueDate ? `- Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}` : ''}
- Total Amount: €${invoice.total}

${invoice.notes ? `\nNotes:\n${invoice.notes}\n` : ''}
${companyProfile.bankAccount ? `\nPayment Details:\n${companyProfile.bankName ? `Bank: ${companyProfile.bankName}\n` : ''}Account: ${companyProfile.bankAccount}\n` : ''}

Thank you for your business!

Best regards,
${currentUser.name}
${companyProfile.name || currentUser.business || ''}
${companyProfile.email || ''}`);

    const mailtoLink = `mailto:${invoice.clientEmail || ''}?subject=${subject}&body=${body}`;
    // Open email composer after a short delay so the 2 downloads complete first
    setTimeout(() => {
      window.location.href = mailtoLink;
    }, 600);
  };

  const exportInvoiceXML = (invoice) => {
    downloadInvoiceXml(invoice);
  };

  const addClient = async (client) => {
    const newClient = {
      ...client,
      id: Date.now().toString(),
      userId: currentUser.email,
      createdAt: new Date().toISOString(),
      active: client.active !== false
    };
    const updated = [...clients, newClient];
    setClients(updated);
    await saveUserData('clients', updated);
  };

  const updateClient = async (id, updates) => {
    const updated = clients.map(c => c.id === id ? { ...c, ...updates } : c);
    setClients(updated);
    await saveUserData('clients', updated);
  };

  const deleteClient = async (id) => {
    const updated = clients.filter(c => c.id !== id);
    setClients(updated);
    await saveUserData('clients', updated);
  };

  const exportData = () => {
    const data = {
      invoices,
      purchaseInvoices: purchaseInvoices,
      clients,
      companyProfile,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookkeeper-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (!data || typeof data !== 'object') {
            alert('Invalid backup file.');
            return resolve();
          }
          const invoicesData = Array.isArray(data.invoices) ? data.invoices : [];
          const purchaseData = Array.isArray(data.purchaseInvoices) ? data.purchaseInvoices : [];
          const clientsData = Array.isArray(data.clients) ? data.clients : [];
          const companyData = data.companyProfile && typeof data.companyProfile === 'object' ? data.companyProfile : companyProfile;
          setInvoices(invoicesData);
          setPurchaseInvoices(purchaseData);
          setClients(clientsData);
          setCompanyProfile(companyData);
          if (currentUser && currentUser.email !== 'demo@bookkeeper.app') {
            const userKey = `user_${currentUser.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
            await window.storage.set(`${userKey}_invoices`, JSON.stringify(invoicesData));
            await window.storage.set(`${userKey}_purchase_invoices`, JSON.stringify(purchaseData));
            await window.storage.set(`${userKey}_clients`, JSON.stringify(clientsData));
            await window.storage.set(`${userKey}_company`, JSON.stringify(companyData));
          }
          alert('Data imported successfully.');
        } catch (err) {
          alert('Could not read file. Please use a valid BookKeeper backup JSON file.');
        }
        resolve();
      };
      reader.onerror = () => { alert('Could not read file.'); resolve(); };
      reader.readAsText(file);
    });
  };

  const testApiConnection = async (base) => {
    const url = (base || apiBaseUrl || import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
    if (!url) return { ok: false, error: 'API URL is empty' };
    if (!isValidApiBaseUrl(url)) return { ok: false, error: 'Use your API server URL (e.g. http://localhost:3003), not the Neon connection string. The connection string belongs in server/.env only.' };
    try {
      const res = await fetch(`${url}/api/health`);
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) return { ok: true };
      return { ok: false, error: data.error || res.statusText || `HTTP ${res.status}` };
    } catch (err) {
      return { ok: false, error: err.message || 'Cannot reach API. Is the server running on ' + url + '?' };
    }
  };

  // Calculate dashboard stats
  const stats = {
    totalInvoiced: invoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0),
    totalPaid: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0),
    totalPending: invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0),
    totalPurchases: purchaseInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0),
    totalPurchasesPaid: purchaseInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0),
    invoiceCount: invoices.length,
    purchaseCount: purchaseInvoices.length,
    clientCount: clients.length
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div style={styles.authContainer}>
        <div className="auth-box" style={styles.authBox}>
          <div style={styles.authHeader}>
            <h1 className="auth-title" style={styles.authTitle}>BookKeeper</h1>
            <p style={styles.authSubtitle}>Manage your business finances with ease</p>
          </div>

          <div style={styles.authTabs}>
            <button
              style={{...styles.authTab, ...(authMode === 'login' ? styles.authTabActive : {})}}
              onClick={() => setAuthMode('login')}
            >
              Login
            </button>
            <button
              style={{...styles.authTab, ...(authMode === 'register' ? styles.authTabActive : {})}}
              onClick={() => setAuthMode('register')}
            >
              Register
            </button>
          </div>

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} style={styles.authForm}>
              <div style={styles.inputGroup}>
                <Mail size={20} style={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="Email address"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <Lock size={20} style={styles.inputIcon} />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>
              <button type="submit" style={styles.authButton}>
                Sign In
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setLoginForm({ email: 'demo@bookkeeper.app', password: 'demo' });
                  setTimeout(() => {
                    document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                  }, 100);
                }}
                style={styles.demoButton}
              >
                Try Demo Account
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={styles.authForm}>
              <div style={styles.inputGroup}>
                <User size={20} style={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="Full name"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <Mail size={20} style={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="Email address"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <FileText size={20} style={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="Business name (optional)"
                  value={registerForm.business}
                  onChange={(e) => setRegisterForm({...registerForm, business: e.target.value})}
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <Lock size={20} style={styles.inputIcon} />
                <input
                  type="password"
                  placeholder="Password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <Lock size={20} style={styles.inputIcon} />
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>
              <button type="submit" style={styles.authButton}>
                Create Account
              </button>
            </form>
          )}

          <div style={styles.authFooter}>
            <div style={styles.demoBox}>
              <p style={styles.demoTitle}>Try Demo Account</p>
              <p style={styles.demoCredentials}>
                Email: <strong>demo@bookkeeper.app</strong><br/>
                Password: <strong>demo</strong>
              </p>
            </div>
            <p style={styles.privacyNote}>
              🔒 Your data is private and securely stored. Only you can access your information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout" style={styles.app}>
      {/* Overlay when sidebar open on mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}
      {/* Sidebar */}
      <div className={`app-sidebar ${sidebarOpen ? 'open' : ''}`} style={styles.sidebar}>
        <div style={{ ...styles.sidebarHeader, position: 'relative' }}>
          <h2 style={styles.logo}>BookKeeper</h2>
          <p style={styles.userInfo}>{currentUser.business || currentUser.name}</p>
          <button type="button" className="sidebar-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X size={24} />
          </button>
        </div>

        <nav className="nav" style={styles.nav}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'invoices', label: 'Sales Invoices', icon: FileText },
            { id: 'purchases', label: 'Purchase Invoices', icon: Receipt },
            { id: 'clients', label: 'Clients', icon: Users },
            { id: 'reports', label: 'Reports', icon: PieChart },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'help', label: 'Help', icon: HelpCircle }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              style={{
                ...styles.navItem,
                ...(activeTab === item.id ? styles.navItemActive : {})
              }}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {(apiBaseUrl || import.meta.env.VITE_API_URL) && isValidApiBaseUrl(apiBaseUrl || import.meta.env.VITE_API_URL) && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontSize: '14px', color: '#6b7280' }}>
              <span style={{ color: '#16a34a' }}>●</span>
              <span>Neon database</span>
            </div>
            {lastNeonSave && (
              <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>
                Last saved: {new Date(lastNeonSave).toLocaleString()}
              </div>
            )}
            <button type="button" onClick={() => currentUser?.email && currentUser.email !== 'demo@bookkeeper.app' && loadUserData(currentUser.email)} disabled={!currentUser || currentUser.email === 'demo@bookkeeper.app' || neonBusy} style={{ ...styles.filterButton, padding: '6px 10px', fontSize: '13px' }}>
              {neonBusy ? '…' : 'Load'}
            </button>
          </div>
        )}

        <button type="button" className="logout-button" onClick={handleLogout} style={styles.logoutButton}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="app-main" style={styles.main}>
        <div className="app-header" style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <button type="button" className="menu-toggle" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={24} />
            </button>
            <h1 style={styles.pageTitle}>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
          </div>
          <div style={styles.headerActions}>
            <span style={styles.userName}>{currentUser.name}</span>
          </div>
        </div>

        <div className="app-content" style={styles.content}>
          {activeTab === 'dashboard' && (
            <Dashboard 
              stats={stats} 
              invoices={invoices}
              purchaseInvoices={purchaseInvoices}
              onViewInvoices={() => setActiveTab('invoices')}
              onViewPurchases={() => setActiveTab('purchases')}
            />
          )}
          
          {activeTab === 'invoices' && (
            <InvoicesTab
              invoices={invoices}
              clients={clients}
              onAdd={() => {
                setModalType('invoice');
                setSelectedInvoice(null);
                setShowModal(true);
              }}
              onEdit={(invoice) => {
                setModalType('invoice');
                setSelectedInvoice(invoice);
                setShowModal(true);
              }}
              onDelete={deleteInvoice}
              onStatusChange={updateInvoice}
              onPrint={printInvoice}
              onEmail={emailInvoice}
              onExportXML={exportInvoiceXML}
            />
          )}

          {activeTab === 'purchases' && (
            <PurchaseInvoicesTab
              purchaseInvoices={purchaseInvoices}
              onAdd={() => {
                setModalType('purchase');
                setSelectedPurchaseInvoice(null);
                setShowModal(true);
              }}
              onEdit={(invoice) => {
                setModalType('purchase');
                setSelectedPurchaseInvoice(invoice);
                setShowModal(true);
              }}
              onDelete={deletePurchaseInvoice}
              onStatusChange={updatePurchaseInvoice}
            />
          )}

          {activeTab === 'clients' && (
            <ClientsTab
              clients={clients}
              onAdd={() => {
                setSelectedClient(null);
                setModalType('client');
                setShowModal(true);
              }}
              onEdit={(client) => {
                setSelectedClient(client);
                setModalType('client');
                setShowModal(true);
              }}
              onStatusChange={updateClient}
              onDelete={deleteClient}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsTab
              stats={stats}
              invoices={invoices}
              purchaseInvoices={purchaseInvoices}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              companyProfile={companyProfile}
              onSave={saveCompanyProfile}
              onExportData={exportData}
              onImportData={importData}
              apiBaseUrl={apiBaseUrl}
              onApiBaseUrlChange={(url) => {
                const u = (url || '').trim();
                if (u && !isValidApiBaseUrl(u)) {
                  alert('Use your API server URL (e.g. http://localhost:3003), not the Neon connection string. The connection string belongs in server/.env only.');
                  return;
                }
                setApiBaseUrl(u);
                try { localStorage.setItem('bookkeeper_api_base_url', u || ''); } catch (_) {}
              }}
              lastNeonSave={lastNeonSave}
              neonBusy={neonBusy}
              onLoadFromNeon={() => currentUser?.email && currentUser.email !== 'demo@bookkeeper.app' && loadUserData(currentUser.email)}
              currentUser={currentUser}
              onTestConnection={testApiConnection}
            />
          )}

          {activeTab === 'help' && <HelpTab />}
        </div>
      </div>

      {/* Modals */}
      {showModal && modalType === 'invoice' && (
        <InvoiceModal
          invoice={selectedInvoice}
          clients={clients}
          onSave={async (invoiceData) => {
            if (selectedInvoice) {
              await updateInvoice(selectedInvoice.id, invoiceData);
            } else {
              await addInvoice(invoiceData);
            }
            setShowModal(false);
            setSelectedInvoice(null);
          }}
          onClose={() => {
            setShowModal(false);
            setSelectedInvoice(null);
          }}
        />
      )}

      {showModal && modalType === 'purchase' && (
        <PurchaseInvoiceModal
          invoice={selectedPurchaseInvoice}
          onSave={async (invoiceData) => {
            if (selectedPurchaseInvoice) {
              await updatePurchaseInvoice(selectedPurchaseInvoice.id, invoiceData);
            } else {
              await addPurchaseInvoice(invoiceData);
            }
            setShowModal(false);
            setSelectedPurchaseInvoice(null);
          }}
          onClose={() => {
            setShowModal(false);
            setSelectedPurchaseInvoice(null);
          }}
        />
      )}

      {showModal && modalType === 'client' && (
        <ClientModal
          client={selectedClient}
          onSave={async (clientData) => {
            if (selectedClient) {
              await updateClient(selectedClient.id, clientData);
            } else {
              await addClient(clientData);
            }
            setShowModal(false);
            setSelectedClient(null);
          }}
          onClose={() => { setShowModal(false); setSelectedClient(null); }}
        />
      )}
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ stats, invoices, purchaseInvoices, onViewInvoices, onViewPurchases }) => {
  const profit = stats.totalPaid - stats.totalPurchasesPaid;
  const recentInvoices = invoices.slice(-5).reverse();
  const recentPurchases = purchaseInvoices.slice(-5).reverse();

  return (
    <div>
      <div style={styles.statsGrid}>
        <StatCard
          title="Total Invoiced"
          value={`€${stats.totalInvoiced.toFixed(2)}`}
          icon={FileText}
          color="#3b82f6"
        />
        <StatCard
          title="Paid (Sales)"
          value={`€${stats.totalPaid.toFixed(2)}`}
          icon={DollarSign}
          color="#10b981"
        />
        <StatCard
          title="Pending (Sales)"
          value={`€${stats.totalPending.toFixed(2)}`}
          icon={TrendingUp}
          color="#f59e0b"
        />
        <StatCard
          title="Purchases"
          value={`€${stats.totalPurchases.toFixed(2)}`}
          icon={Receipt}
          color="#ef4444"
        />
        <StatCard
          title="Net Profit"
          value={`€${profit.toFixed(2)}`}
          icon={profit >= 0 ? TrendingUp : TrendingDown}
          color={profit >= 0 ? "#10b981" : "#ef4444"}
        />
        <StatCard
          title="Clients"
          value={stats.clientCount}
          icon={Users}
          color="#8b5cf6"
        />
      </div>

      <div className="dashboard-grid" style={styles.dashboardGrid}>
        <div style={styles.dashboardCard}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Recent Sales Invoices</h3>
            <button onClick={onViewInvoices} style={styles.linkButton}>View All</button>
          </div>
          {recentInvoices.length > 0 ? (
            <div style={styles.listContainer}>
              {recentInvoices.map(invoice => (
                <div key={invoice.id} style={styles.listItem}>
                  <div>
                    <p style={styles.listItemTitle}>{invoice.clientName}</p>
                    <p style={styles.listItemSubtitle}>Invoice #{invoice.number}</p>
                  </div>
                  <div style={styles.listItemRight}>
                    <span style={styles.amount}>€{invoice.total}</span>
                    <span style={{
                      ...styles.badge,
                      ...(invoice.status === 'paid' ? styles.badgePaid : styles.badgePending)
                    }}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.emptyState}>No invoices yet</p>
          )}
        </div>

        <div style={styles.dashboardCard}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Recent Purchase Invoices</h3>
            <button onClick={onViewPurchases} style={styles.linkButton}>View All</button>
          </div>
          {recentPurchases.length > 0 ? (
            <div style={styles.listContainer}>
              {recentPurchases.map(invoice => (
                <div key={invoice.id} style={styles.listItem}>
                  <div>
                    <p style={styles.listItemTitle}>{invoice.supplierName}</p>
                    <p style={styles.listItemSubtitle}>{invoice.number}</p>
                  </div>
                  <div style={styles.listItemRight}>
                    <span style={styles.amount}>€{invoice.total}</span>
                    <span style={{
                      ...styles.badge,
                      ...(invoice.status === 'paid' ? styles.badgePaid : styles.badgePending)
                    }}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.emptyState}>No purchase invoices yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div style={styles.statCard}>
    <div style={{...styles.statIcon, backgroundColor: `${color}20`}}>
      <Icon size={24} color={color} />
    </div>
    <div style={styles.statContent}>
      <p style={styles.statTitle}>{title}</p>
      <p style={styles.statValue}>{value}</p>
    </div>
  </div>
);

// Invoices Tab
const InvoicesTab = ({ invoices, clients, onAdd, onEdit, onDelete, onStatusChange, onPrint, onEmail, onExportXML }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const byStatus = filter === 'all' ? invoices : invoices.filter(inv => inv.status === filter);
  const searchLower = search.trim().toLowerCase();
  const filteredInvoices = searchLower
    ? byStatus.filter(inv =>
        (inv.number || '').toLowerCase().includes(searchLower) ||
        (inv.clientName || '').toLowerCase().includes(searchLower))
    : byStatus;

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    let va, vb;
    switch (sortBy) {
      case 'number': va = (a.number || ''); vb = (b.number || ''); return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      case 'clientName': va = (a.clientName || '').toLowerCase(); vb = (b.clientName || '').toLowerCase(); return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      case 'date': va = new Date(a.date).getTime(); vb = new Date(b.date).getTime(); return sortDir === 'asc' ? va - vb : vb - va;
      case 'total': va = parseFloat(a.total || 0); vb = parseFloat(b.total || 0); return sortDir === 'asc' ? va - vb : vb - va;
      case 'status': va = (a.status || ''); vb = (b.status || ''); return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      default: return 0;
    }
  });

  const SortIcon = ({ col }) => (
    sortBy === col ? (sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={14} style={{ opacity: 0.4 }} />
  );

  return (
    <div>
      <div className="tab-header-row" style={styles.tabHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={styles.filterGroup}>
            {['all', 'pending', 'paid', 'overdue'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  ...styles.filterButton,
                  ...(filter === f ? styles.filterButtonActive : {})
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div style={styles.searchWrapper}>
            <Search size={18} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by invoice # or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input-mobile"
              style={styles.searchInput}
            />
          </div>
        </div>
        <button onClick={onAdd} className="add-button-touch" style={styles.addButton}>
          <Plus size={20} />
          New Invoice
        </button>
      </div>

      <div className="table-scroll">
      <div style={styles.table}>
        <div style={{...styles.tableHeader, gridTemplateColumns: '120px 180px 100px 100px 100px 240px'}}>
          <div style={{...styles.th, ...styles.sortableTh}} onClick={() => toggleSort('number')}>Invoice # <SortIcon col="number" /></div>
          <div style={{...styles.th, ...styles.sortableTh}} onClick={() => toggleSort('clientName')}>Client <SortIcon col="clientName" /></div>
          <div style={{...styles.th, ...styles.sortableTh}} onClick={() => toggleSort('date')}>Date <SortIcon col="date" /></div>
          <div style={{...styles.th, ...styles.sortableTh}} onClick={() => toggleSort('total')}>Amount <SortIcon col="total" /></div>
          <div style={{...styles.th, ...styles.sortableTh}} onClick={() => toggleSort('status')}>Status <SortIcon col="status" /></div>
          <div style={styles.th}>Actions</div>
        </div>
        {sortedInvoices.length > 0 ? (
          sortedInvoices.map(invoice => (
            <div key={invoice.id} style={{...styles.tableRow, gridTemplateColumns: '120px 180px 100px 100px 100px 240px'}}>
              <div style={styles.td}>{invoice.number}</div>
              <div style={styles.td}>{invoice.clientName}</div>
              <div style={styles.td}>{new Date(invoice.date).toLocaleDateString()}</div>
              <div style={styles.td}>€{invoice.total}</div>
              <div style={styles.td}>
                <select
                  value={invoice.status}
                  onChange={(e) => onStatusChange(invoice.id, { status: e.target.value })}
                  style={styles.statusSelect}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div style={styles.td}>
                <div style={styles.actionButtons}>
                  <button 
                    onClick={() => onPrint(invoice)} 
                    style={styles.iconButton}
                    title="Print Invoice"
                  >
                    <Printer size={16} />
                  </button>
                  <button 
                    onClick={() => onEmail(invoice)} 
                    style={styles.iconButton}
                    title="Email Invoice"
                  >
                    <Send size={16} />
                  </button>
                  <button 
                    onClick={() => onExportXML(invoice)} 
                    style={{...styles.iconButton, background: '#d1fae5', color: '#065f46'}}
                    title="Export XML (e-Invoice)"
                  >
                    <FileDown size={16} />
                  </button>
                  <button 
                    onClick={() => onEdit(invoice)} 
                    style={styles.iconButton}
                    title="Edit Invoice"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => onDelete(invoice.id)} 
                    style={styles.iconButtonDanger}
                    title="Delete Invoice"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={styles.emptyTable}>No invoices found</div>
        )}
      </div>
      </div>
    </div>
  );
};

// Clients Tab
const ClientsTab = ({ clients, onAdd, onEdit, onStatusChange, onDelete }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const isActive = (c) => c.active !== false;
  const byStatus = filter === 'all' ? clients : filter === 'active' ? clients.filter(isActive) : clients.filter(c => c.active === false);
  const searchLower = search.trim().toLowerCase();
  const filteredClients = searchLower
    ? byStatus.filter(c =>
        (c.name || '').toLowerCase().includes(searchLower) ||
        (c.email || '').toLowerCase().includes(searchLower) ||
        (c.phone || '').toLowerCase().includes(searchLower) ||
        (c.address || '').toLowerCase().includes(searchLower) ||
        (c.regNumber || '').toLowerCase().includes(searchLower))
    : byStatus;

  const sortedClients = [...filteredClients].sort((a, b) => {
    let va, vb;
    switch (sortBy) {
      case 'name': va = (a.name || '').toLowerCase(); vb = (b.name || '').toLowerCase(); return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      case 'email': va = (a.email || '').toLowerCase(); vb = (b.email || '').toLowerCase(); return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      case 'phone': va = (a.phone || ''); vb = (b.phone || ''); return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      case 'address': va = (a.address || '').toLowerCase(); vb = (b.address || '').toLowerCase(); return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      case 'regNumber': va = (a.regNumber || ''); vb = (b.regNumber || ''); return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      case 'active': va = isActive(a) ? 1 : 0; vb = isActive(b) ? 1 : 0; return sortDir === 'asc' ? va - vb : vb - va;
      default: return 0;
    }
  });

  const SortIcon = ({ col }) => (
    sortBy === col ? (sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={14} style={{ opacity: 0.4 }} />
  );

  const gridCols = '200px 200px 120px 160px 100px 90px 160px';

  return (
    <div>
      <div className="tab-header-row" style={styles.tabHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={styles.filterGroup}>
            {['all', 'active', 'passive'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  ...styles.filterButton,
                  ...(filter === f ? styles.filterButtonActive : {})
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div style={styles.searchWrapper}>
            <Search size={18} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search clients by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input-mobile"
              style={styles.searchInput}
            />
          </div>
        </div>
        <button onClick={onAdd} className="add-button-touch" style={styles.addButton}>
          <Plus size={20} />
          New Client
        </button>
      </div>

      <div className="table-scroll">
      <div style={styles.table}>
        <div style={{...styles.tableHeader, gridTemplateColumns: gridCols}}>
          <div style={{...styles.th, ...styles.sortableTh}} onClick={() => toggleSort('name')}>Name <SortIcon col="name" /></div>
          <div style={{...styles.th, ...styles.sortableTh}} onClick={() => toggleSort('email')}>Email <SortIcon col="email" /></div>
          <div style={{...styles.th, ...styles.sortableTh}} onClick={() => toggleSort('phone')}>Phone <SortIcon col="phone" /></div>
          <div style={{...styles.th, ...styles.sortableTh}} onClick={() => toggleSort('address')}>Address <SortIcon col="address" /></div>
          <div style={{...styles.th, ...styles.sortableTh}} onClick={() => toggleSort('regNumber')}>Reg. No <SortIcon col="regNumber" /></div>
          <div style={{...styles.th, ...styles.sortableTh}} onClick={() => toggleSort('active')}>Status <SortIcon col="active" /></div>
          <div style={styles.th}>Actions</div>
        </div>
        {sortedClients.length > 0 ? (
          sortedClients.map(client => (
            <div key={client.id} style={{...styles.tableRow, gridTemplateColumns: gridCols}}>
              <div style={styles.td}>{client.name}</div>
              <div style={styles.td}>{client.email}</div>
              <div style={styles.td}>{client.phone}</div>
              <div style={styles.td}>{client.address}</div>
              <div style={styles.td}>{client.regNumber || '-'}</div>
              <div style={styles.td}>
                <select
                  value={client.active !== false ? 'active' : 'passive'}
                  onChange={(e) => onStatusChange(client.id, { active: e.target.value === 'active' })}
                  style={styles.statusSelect}
                >
                  <option value="active">Active</option>
                  <option value="passive">Passive</option>
                </select>
              </div>
              <div style={styles.td}>
                <div style={styles.actionButtons}>
                  <button onClick={() => onEdit(client)} style={styles.iconButton} title="Edit Client">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => onDelete(client.id)} style={styles.iconButtonDanger} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={styles.emptyTable}>No clients found</div>
        )}
      </div>
      </div>
    </div>
  );
};

// Reports Tab
const ReportsTab = ({ stats, invoices, purchaseInvoices }) => {
  const monthlyData = {};
  
  // Aggregate by month
  invoices.forEach(inv => {
    const month = new Date(inv.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    if (!monthlyData[month]) monthlyData[month] = { income: 0, purchases: 0 };
    if (inv.status === 'paid') monthlyData[month].income += parseFloat(inv.total);
  });
  
  purchaseInvoices.forEach(inv => {
    const month = new Date(inv.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    if (!monthlyData[month]) monthlyData[month] = { income: 0, purchases: 0 };
    if (inv.status === 'paid') monthlyData[month].purchases += parseFloat(inv.total);
  });

  const profit = stats.totalPaid - stats.totalPurchasesPaid;
  const profitMargin = stats.totalPaid > 0 ? ((profit / stats.totalPaid) * 100).toFixed(1) : 0;

  return (
    <div>
      <div style={styles.statsGrid}>
        <div style={styles.reportCard}>
          <h3 style={styles.reportCardTitle}>Net Profit</h3>
          <p style={{...styles.reportCardValue, color: profit >= 0 ? '#10b981' : '#ef4444'}}>
            €{profit.toFixed(2)}
          </p>
        </div>
        <div style={styles.reportCard}>
          <h3 style={styles.reportCardTitle}>Profit Margin</h3>
          <p style={styles.reportCardValue}>{profitMargin}%</p>
        </div>
        <div style={styles.reportCard}>
          <h3 style={styles.reportCardTitle}>Avg Invoice</h3>
          <p style={styles.reportCardValue}>
            €{stats.invoiceCount > 0 ? (stats.totalInvoiced / stats.invoiceCount).toFixed(2) : 0}
          </p>
        </div>
        <div style={styles.reportCard}>
          <h3 style={styles.reportCardTitle}>Outstanding</h3>
          <p style={styles.reportCardValue}>€{stats.totalPending.toFixed(2)}</p>
        </div>
      </div>

      <div style={styles.reportCard}>
        <h3 style={styles.cardTitle}>Monthly Overview</h3>
        <div style={styles.monthlyTable}>
          <div style={styles.tableHeader}>
            <div style={styles.th}>Month</div>
            <div style={styles.th}>Sales Income</div>
            <div style={styles.th}>Purchases</div>
            <div style={styles.th}>Profit</div>
          </div>
          {Object.entries(monthlyData).map(([month, data]) => (
            <div key={month} style={styles.tableRow}>
              <div style={styles.td}>{month}</div>
              <div style={styles.td}>€{data.income.toFixed(2)}</div>
              <div style={styles.td}>€{data.purchases.toFixed(2)}</div>
              <div style={{
                ...styles.td,
                color: (data.income - data.purchases) >= 0 ? '#10b981' : '#ef4444'
              }}>
                €{(data.income - data.purchases).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Invoice Modal
const InvoiceModal = ({ invoice, clients, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    number: invoice?.number || `INV-${Date.now()}`,
    clientName: invoice?.clientName || '',
    clientEmail: invoice?.clientEmail || '',
    date: invoice?.date || new Date().toISOString().split('T')[0],
    dueDate: invoice?.dueDate || '',
    items: invoice?.items || [{ description: '', quantity: 1, price: 0 }],
    notes: invoice?.notes || '',
    vatRate: invoice?.vatRate !== undefined ? invoice.vatRate : 22,
    includeVat: invoice?.includeVat !== undefined ? invoice.includeVat : true
  });

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, price: 0 }]
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const subtotal = formData.items.reduce((sum, item) => 
    sum + (parseFloat(item.quantity) * parseFloat(item.price)), 0
  );

  const vatAmount = formData.includeVat ? (subtotal * (parseFloat(formData.vatRate) / 100)) : 0;
  const total = subtotal + vatAmount;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ 
      ...formData, 
      subtotal: subtotal.toFixed(2),
      vatAmount: vatAmount.toFixed(2),
      total: total.toFixed(2) 
    });
  };

  return (
    <div className="modal-overlay" style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>{invoice ? 'Edit Invoice' : 'New Invoice'}</h2>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.modalForm}>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Invoice Number</label>
              <input
                type="text"
                value={formData.number}
                onChange={(e) => setFormData({...formData, number: e.target.value})}
                style={styles.modalInput}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                style={styles.modalInput}
                required
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Client Name</label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                style={styles.modalInput}
                list="clients-list"
                required
              />
              <datalist id="clients-list">
                {clients.map(client => (
                  <option key={client.id} value={client.name} />
                ))}
              </datalist>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                style={styles.modalInput}
              />
            </div>
          </div>

          <div style={styles.itemsSection}>
            <div style={styles.itemsHeader}>
              <h3 style={styles.sectionTitle}>Items</h3>
              <button type="button" onClick={addItem} style={styles.addItemButton}>
                <Plus size={16} /> Add Item
              </button>
            </div>
            
            {formData.items.map((item, index) => (
              <div key={index} style={styles.itemRow}>
                <input
                  type="text"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  style={{...styles.modalInput, flex: 2}}
                  required
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                  style={{...styles.modalInput, width: '80px'}}
                  min="1"
                  required
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={item.price}
                  onChange={(e) => updateItem(index, 'price', e.target.value)}
                  style={{...styles.modalInput, width: '100px'}}
                  step="0.01"
                  min="0"
                  required
                />
                <span style={styles.itemTotal}>
                  €{(item.quantity * item.price).toFixed(2)}
                </span>
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    style={styles.removeItemButton}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div style={styles.vatSection}>
            <div style={styles.vatControls}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.includeVat}
                  onChange={(e) => setFormData({...formData, includeVat: e.target.checked})}
                  style={styles.checkbox}
                />
                <span>Include VAT</span>
              </label>
              
              {formData.includeVat && (
                <div style={styles.vatRateGroup}>
                  <label style={styles.label}>VAT Rate (%)</label>
                  <select
                    value={formData.vatRate}
                    onChange={(e) => setFormData({...formData, vatRate: parseFloat(e.target.value)})}
                    style={{...styles.modalInput, width: '120px'}}
                  >
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="9">9%</option>
                    <option value="10">10%</option>
                    <option value="13">13%</option>
                    <option value="20">20%</option>
                    <option value="22">22%</option>
                    <option value="24">24%</option>
                    <option value="25">25%</option>
                  </select>
                  <input
                    type="number"
                    value={formData.vatRate}
                    onChange={(e) => setFormData({...formData, vatRate: parseFloat(e.target.value) || 0})}
                    style={{...styles.modalInput, width: '80px', marginLeft: '8px'}}
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="Custom"
                  />
                </div>
              )}
            </div>

            <div style={styles.totalsBreakdown}>
              <div style={styles.totalRow}>
                <span>Subtotal:</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>
              {formData.includeVat && (
                <div style={styles.totalRow}>
                  <span>VAT ({formData.vatRate}%):</span>
                  <span>€{vatAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={{...styles.totalRow, ...styles.totalRowFinal}}>
                <strong>Total:</strong>
                <strong>€{total.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              style={styles.textarea}
              rows="3"
            />
          </div>

          <div style={styles.modalActions}>
            <button type="button" onClick={onClose} style={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" style={styles.saveButton}>
              <Save size={20} />
              Save Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Client Modal
const ClientModal = ({ client, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    regNumber: '',
    vatNumber: '',
    active: true
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        regNumber: client.regNumber || '',
        vatNumber: client.vatNumber || '',
        active: client.active !== false
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        regNumber: '',
        vatNumber: '',
        active: true
      });
    }
  }, [client]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, active: formData.active });
  };

  return (
    <div className="modal-overlay" style={styles.modalOverlay} onClick={onClose}>
      <div style={{...styles.modalContent, maxWidth: '500px'}} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>{client ? 'Edit Client' : 'New Client'}</h2>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.modalForm}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={styles.modalInput}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={styles.modalInput}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              style={styles.modalInput}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Registration Number</label>
            <input
              type="text"
              value={formData.regNumber}
              onChange={(e) => setFormData({...formData, regNumber: e.target.value})}
              style={styles.modalInput}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>VAT Number</label>
            <input
              type="text"
              value={formData.vatNumber}
              onChange={(e) => setFormData({...formData, vatNumber: e.target.value})}
              style={styles.modalInput}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              style={styles.textarea}
              rows="3"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={{...styles.label, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({...formData, active: e.target.checked})}
                style={{ width: '18px', height: '18px' }}
              />
              Active customer
            </label>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>Passive customers are hidden from default lists but kept for history.</p>
          </div>

          <div style={styles.modalActions}>
            <button type="button" onClick={onClose} style={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" style={styles.saveButton}>
              <Save size={20} />
              {client ? 'Update Client' : 'Save Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Styles
const styles = {
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid rgba(255,255,255,0.3)',
    borderTop: '5px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  authContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  },
  authBox: {
    background: 'white',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  authHeader: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  authTitle: {
    fontSize: '32px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '8px'
  },
  authSubtitle: {
    color: '#6b7280',
    fontSize: '14px'
  },
  authTabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    background: '#f3f4f6',
    padding: '4px',
    borderRadius: '8px'
  },
  authTab: {
    flex: 1,
    padding: '10px',
    border: 'none',
    background: 'transparent',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    transition: 'all 0.2s'
  },
  authTabActive: {
    background: 'white',
    color: '#667eea',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  authForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  inputGroup: {
    position: 'relative'
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af'
  },
  input: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  },
  authButton: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    marginTop: '10px'
  },
  demoButton: {
    width: '100%',
    padding: '14px',
    background: 'white',
    color: '#667eea',
    border: '2px solid #667eea',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '10px'
  },
  authFooter: {
    marginTop: '20px',
    textAlign: 'center'
  },
  demoBox: {
    background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '16px',
    border: '1px solid #667eea30'
  },
  demoTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#667eea',
    marginBottom: '8px'
  },
  demoCredentials: {
    fontSize: '13px',
    color: '#374151',
    lineHeight: '1.6'
  },
  privacyNote: {
    fontSize: '13px',
    color: '#6b7280',
    lineHeight: '1.5'
  },
  app: {
    display: 'flex',
    height: '100vh',
    background: '#f9fafb',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  sidebar: {
    width: '260px',
    background: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 0'
  },
  sidebarHeader: {
    padding: '0 24px',
    marginBottom: '30px'
  },
  logo: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '8px'
  },
  userInfo: {
    fontSize: '13px',
    color: '#9ca3af',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '0 12px'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    color: '#9ca3af',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    textAlign: 'left'
  },
  navItemActive: {
    background: 'rgba(255,255,255,0.1)',
    color: 'white'
  },
  logoutButton: {
    margin: '0 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#ef4444',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  header: {
    padding: '24px 32px',
    background: 'white',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  userName: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500'
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '32px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  statCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  statIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statContent: {
    flex: 1
  },
  statTitle: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '4px',
    fontWeight: '500'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827'
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px'
  },
  dashboardCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827'
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: '#f9fafb',
    borderRadius: '8px'
  },
  listItemTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '4px'
  },
  listItemSubtitle: {
    fontSize: '13px',
    color: '#6b7280'
  },
  listItemRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  amount: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#111827'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'capitalize'
  },
  badgePaid: {
    background: '#d1fae5',
    color: '#065f46'
  },
  badgePending: {
    background: '#fef3c7',
    color: '#92400e'
  },
  emptyState: {
    textAlign: 'center',
    color: '#9ca3af',
    padding: '40px',
    fontSize: '14px'
  },
  tabHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  filterGroup: {
    display: 'flex',
    gap: '8px'
  },
  filterButton: {
    padding: '8px 16px',
    border: '1px solid #e5e7eb',
    background: 'white',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#6b7280',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  filterButtonActive: {
    background: '#667eea',
    color: 'white',
    borderColor: '#667eea'
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  table: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '150px 200px 120px 120px 120px 150px',
    gap: '16px',
    padding: '16px 24px',
    background: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
    fontWeight: '600',
    fontSize: '13px',
    color: '#6b7280'
  },
  th: {
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  sortableTh: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    userSelect: 'none'
  },
  searchInput: {
    padding: '8px 12px 8px 36px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    width: '220px',
    outline: 'none'
  },
  searchWrapper: {
    position: 'relative',
    display: 'inline-block'
  },
  searchIcon: {
    position: 'absolute',
    left: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    pointerEvents: 'none'
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '150px 200px 120px 120px 120px 150px',
    gap: '16px',
    padding: '16px 24px',
    borderBottom: '1px solid #f3f4f6',
    alignItems: 'center'
  },
  td: {
    fontSize: '14px',
    color: '#374151',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  statusSelect: {
    padding: '6px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
    background: 'white'
  },
  actionButtons: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap'
  },
  iconButton: {
    padding: '8px',
    border: 'none',
    background: '#f3f4f6',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconButtonDanger: {
    padding: '8px',
    border: 'none',
    background: '#fee2e2',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#dc2626',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyTable: {
    padding: '60px',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '14px'
  },
  reportCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  reportCardTitle: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '8px',
    fontWeight: '500'
  },
  reportCardValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827'
  },
  monthlyTable: {
    marginTop: '20px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modalContent: {
    background: 'white',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  modalHeader: {
    padding: '24px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    background: 'white',
    zIndex: 1
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px',
    display: 'flex',
    alignItems: 'center'
  },
  modalForm: {
    padding: '24px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px'
  },
  formGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  },
  modalInput: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  },
  itemsSection: {
    marginBottom: '24px'
  },
  itemsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827'
  },
  addItemButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    background: '#f3f4f6',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    color: '#374151'
  },
  itemRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '12px',
    alignItems: 'center'
  },
  itemTotal: {
    minWidth: '100px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    textAlign: 'right'
  },
  removeItemButton: {
    padding: '8px',
    background: '#fee2e2',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#dc2626',
    display: 'flex',
    alignItems: 'center'
  },
  totalSection: {
    padding: '16px',
    background: '#f9fafb',
    borderRadius: '8px',
    marginBottom: '24px',
    textAlign: 'right',
    fontSize: '18px',
    color: '#111827'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb'
  },
  cancelButton: {
    padding: '10px 20px',
    background: '#f3f4f6',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    color: '#374151'
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};

// Add animation keyframes
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default BookkeeperApp;

// Purchase Invoices Tab
const PurchaseInvoicesTab = ({ purchaseInvoices, onAdd, onEdit, onDelete, onStatusChange }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const byStatus = filter === 'all' ? purchaseInvoices : purchaseInvoices.filter(inv => inv.status === filter);
  const searchLower = search.trim().toLowerCase();
  const filteredInvoices = searchLower
    ? byStatus.filter(inv =>
        (inv.number || '').toLowerCase().includes(searchLower) ||
        (inv.supplierName || '').toLowerCase().includes(searchLower))
    : byStatus;

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    let va, vb;
    switch (sortBy) {
      case 'number': va = (a.number || ''); vb = (b.number || ''); return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      case 'supplierName': va = (a.supplierName || '').toLowerCase(); vb = (b.supplierName || '').toLowerCase(); return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      case 'date': va = new Date(a.date).getTime(); vb = new Date(b.date).getTime(); return sortDir === 'asc' ? va - vb : vb - va;
      case 'total': va = parseFloat(a.total || 0); vb = parseFloat(b.total || 0); return sortDir === 'asc' ? va - vb : vb - va;
      case 'status': va = (a.status || ''); vb = (b.status || ''); return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      default: return 0;
    }
  });

  const SortIcon = ({ col }) => (
    sortBy === col ? (sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={14} style={{ opacity: 0.4 }} />
  );

  return (
    <div>
      <div className="tab-header-row" style={styles.tabHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={styles.filterGroup}>
            {['all', 'pending', 'paid'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  ...styles.filterButton,
                  ...(filter === f ? styles.filterButtonActive : {})
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div style={styles.searchWrapper}>
            <Search size={18} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by invoice # or supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input-mobile"
              style={styles.searchInput}
            />
          </div>
        </div>
        <button onClick={onAdd} className="add-button-touch" style={styles.addButton}>
          <Plus size={20} />
          New Purchase Invoice
        </button>
      </div>

      <div className="table-scroll">
      <div style={styles.table}>
        <div style={{...styles.tableHeader, gridTemplateColumns: '120px 180px 100px 100px 100px 200px'}}>
          <div style={{...styles.th, ...styles.sortableTh}} onClick={() => toggleSort('number')}>Invoice # <SortIcon col="number" /></div>
          <div style={{...styles.th, ...styles.sortableTh}} onClick={() => toggleSort('supplierName')}>Supplier <SortIcon col="supplierName" /></div>
          <div style={{...styles.th, ...styles.sortableTh}} onClick={() => toggleSort('date')}>Date <SortIcon col="date" /></div>
          <div style={{...styles.th, ...styles.sortableTh}} onClick={() => toggleSort('total')}>Amount <SortIcon col="total" /></div>
          <div style={{...styles.th, ...styles.sortableTh}} onClick={() => toggleSort('status')}>Status <SortIcon col="status" /></div>
          <div style={styles.th}>Actions</div>
        </div>
        {sortedInvoices.length > 0 ? (
          sortedInvoices.map(invoice => (
            <div key={invoice.id} style={{...styles.tableRow, gridTemplateColumns: '120px 180px 100px 100px 100px 200px'}}>
              <div style={styles.td}>{invoice.number}</div>
              <div style={styles.td}>{invoice.supplierName}</div>
              <div style={styles.td}>{new Date(invoice.date).toLocaleDateString()}</div>
              <div style={styles.td}>€{invoice.total}</div>
              <div style={styles.td}>
                <select
                  value={invoice.status}
                  onChange={(e) => onStatusChange(invoice.id, { status: e.target.value })}
                  style={styles.statusSelect}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div style={styles.td}>
                <div style={styles.actionButtons}>
                  <button onClick={() => onEdit(invoice)} style={styles.iconButton}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => onDelete(invoice.id)} style={styles.iconButtonDanger}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={styles.emptyTable}>No purchase invoices found</div>
        )}
      </div>
      </div>
    </div>
  );
};

// Help Tab
const HelpTab = () => {
  const developerEmail = 'laurisoosaar@gmail.com';
  const developerSite = 'yrgel.com';
  const mailtoSubject = encodeURIComponent('BookKeeper – Support / Feedback');
  const mailtoLink = `mailto:${developerEmail}?subject=${mailtoSubject}`;

  return (
    <div style={{ maxWidth: '560px' }}>
      <div style={styles.reportCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <HelpCircle size={28} color="#667eea" />
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>Help &amp; Support</h2>
        </div>
        <p style={{ margin: '0 0 20px', fontSize: '15px', color: '#4b5563', lineHeight: 1.6 }}>
          Need help or want to send feedback? Contact the developer.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <a
            href={mailtoLink}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: '#667eea',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '15px',
              width: 'fit-content'
            }}
          >
            <Mail size={20} />
            Send message to developer
          </a>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
            Developer: <strong>{developerSite}</strong> · <a href={mailtoLink} style={{ color: '#667eea', textDecoration: 'none' }}>{developerEmail}</a>
          </p>
        </div>
      </div>
    </div>
  );
};

// Settings Tab
const SettingsTab = ({ companyProfile, onSave, onExportData, onImportData, apiBaseUrl, onApiBaseUrlChange, lastNeonSave, neonBusy, onLoadFromNeon, currentUser, onTestConnection }) => {
  const [formData, setFormData] = useState(companyProfile);
  const [saving, setSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [connectionChecking, setConnectionChecking] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleTestConnection = async () => {
    const base = (apiBaseUrl || import.meta.env.VITE_API_URL || '').trim();
    if (!base) { setConnectionStatus({ ok: false, error: 'Enter API URL first' }); return; }
    setConnectionChecking(true);
    setConnectionStatus(null);
    const result = await onTestConnection?.(base);
    setConnectionStatus(result);
    setConnectionChecking(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(formData);
    setSaving(false);
    alert('Company profile saved successfully!');
  };

  const handleImportClick = () => fileInputRef.current?.click();
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!confirm('Import will replace your current invoices, clients, and company data. Continue?')) {
      e.target.value = '';
      return;
    }
    await onImportData(file);
    e.target.value = '';
  };

  return (
    <div>
      <div style={styles.settingsContainer}>
        <h2 style={styles.settingsTitle}>Company Profile</h2>
        <p style={styles.settingsSubtitle}>
          This information will appear on your sales invoices
        </p>

        <form onSubmit={handleSubmit} style={styles.settingsForm}>
          <div style={styles.formSection}>
            <h3 style={styles.sectionTitle}>Basic Information</h3>
            
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Company Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={styles.modalInput}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Registration Number</label>
                <input
                  type="text"
                  value={formData.regNumber}
                  onChange={(e) => setFormData({...formData, regNumber: e.target.value})}
                  style={styles.modalInput}
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>VAT Number</label>
                <input
                  type="text"
                  value={formData.vatNumber}
                  onChange={(e) => setFormData({...formData, vatNumber: e.target.value})}
                  style={styles.modalInput}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  style={styles.modalInput}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={styles.modalInput}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                style={styles.modalInput}
                placeholder="https://www.example.com"
              />
            </div>
          </div>

          <div style={styles.formSection}>
            <h3 style={styles.sectionTitle}>Address</h3>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Street Address *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                style={styles.modalInput}
                required
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  style={styles.modalInput}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Postal Code</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                  style={styles.modalInput}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Country *</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                style={styles.modalInput}
                required
              />
            </div>
          </div>

          <div style={styles.formSection}>
            <h3 style={styles.sectionTitle}>Banking Information</h3>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Bank Name</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                style={styles.modalInput}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Bank Account / IBAN</label>
              <input
                type="text"
                value={formData.bankAccount}
                onChange={(e) => setFormData({...formData, bankAccount: e.target.value})}
                style={styles.modalInput}
                placeholder="EE123456789012345678"
              />
            </div>
          </div>

          <div style={styles.formSection}>
            <h3 style={styles.sectionTitle}>Database (Neon)</h3>
            <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#6b7280' }}>
              Store your data in <a href="https://console.neon.tech" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>Neon</a> Postgres. Run the API server (see README), set <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>DATABASE_URL</code> in <strong>server/.env</strong>, then enter your <strong>API server URL</strong> here (e.g. <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>http://localhost:3003</code>). Do not paste the Neon connection string here.
            </p>
            <div style={{ marginBottom: '12px' }}>
              <label style={styles.label}>API URL (e.g. http://localhost:3003)</label>
              <input
                type="url"
                value={apiBaseUrl || ''}
                onChange={(e) => onApiBaseUrlChange?.(e.target.value)}
                placeholder="http://localhost:3003"
                style={styles.modalInput}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button type="button" onClick={handleTestConnection} disabled={!apiBaseUrl || connectionChecking} style={{ ...styles.filterButton, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                {connectionChecking ? '…' : 'Test connection'}
              </button>
              <button type="button" onClick={onLoadFromNeon} disabled={!apiBaseUrl || !currentUser || currentUser.email === 'demo@bookkeeper.app' || neonBusy} style={{ ...styles.filterButton, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                {neonBusy ? '…' : 'Load from database'}
              </button>
            </div>
            {connectionStatus && (
              <p style={{ margin: '8px 0 0', fontSize: '13px', color: connectionStatus.ok ? '#059669' : '#dc2626' }}>
                {connectionStatus.ok ? '✓ Database connected' : '✗ ' + (connectionStatus.error || 'Connection failed')}
              </p>
            )}
            {lastNeonSave && (
              <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#6b7280' }}>
                Last saved to Neon: {new Date(lastNeonSave).toLocaleString()}
              </p>
            )}
          </div>

          <div style={styles.formSection}>
            <h3 style={styles.sectionTitle}>Data backup (file)</h3>
            <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#6b7280' }}>
              Export your data as a JSON file. Import a backup file to restore data.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button type="button" onClick={onExportData} style={{ ...styles.addButton, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Download size={20} />
                Export data
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json,application/json"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <button type="button" onClick={handleImportClick} style={{ ...styles.filterButton, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} />
                Import from file
              </button>
            </div>
          </div>

          <div style={styles.settingsActions}>
            <button type="submit" style={styles.saveButton} disabled={saving}>
              <Save size={20} />
              {saving ? 'Saving...' : 'Save Company Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Purchase Invoice Modal
const PurchaseInvoiceModal = ({ invoice, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    number: invoice?.number || `PINV-${Date.now()}`,
    supplierName: invoice?.supplierName || '',
    date: invoice?.date || new Date().toISOString().split('T')[0],
    dueDate: invoice?.dueDate || '',
    items: invoice?.items || [{ description: '', quantity: 1, price: 0 }],
    notes: invoice?.notes || '',
    vatRate: invoice?.vatRate !== undefined ? invoice.vatRate : 22,
    includeVat: invoice?.includeVat !== undefined ? invoice.includeVat : true
  });

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, price: 0 }]
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const subtotal = formData.items.reduce((sum, item) => 
    sum + (parseFloat(item.quantity) * parseFloat(item.price)), 0
  );

  const vatAmount = formData.includeVat ? (subtotal * (parseFloat(formData.vatRate) / 100)) : 0;
  const total = subtotal + vatAmount;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ 
      ...formData, 
      subtotal: subtotal.toFixed(2),
      vatAmount: vatAmount.toFixed(2),
      total: total.toFixed(2) 
    });
  };

  return (
    <div className="modal-overlay" style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>{invoice ? 'Edit Purchase Invoice' : 'New Purchase Invoice'}</h2>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.modalForm}>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Invoice Number</label>
              <input
                type="text"
                value={formData.number}
                onChange={(e) => setFormData({...formData, number: e.target.value})}
                style={styles.modalInput}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                style={styles.modalInput}
                required
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Supplier Name</label>
              <input
                type="text"
                value={formData.supplierName}
                onChange={(e) => setFormData({...formData, supplierName: e.target.value})}
                style={styles.modalInput}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                style={styles.modalInput}
              />
            </div>
          </div>

          <div style={styles.itemsSection}>
            <div style={styles.itemsHeader}>
              <h3 style={styles.sectionTitle}>Items</h3>
              <button type="button" onClick={addItem} style={styles.addItemButton}>
                <Plus size={16} /> Add Item
              </button>
            </div>
            
            {formData.items.map((item, index) => (
              <div key={index} style={styles.itemRow}>
                <input
                  type="text"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  style={{...styles.modalInput, flex: 2}}
                  required
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                  style={{...styles.modalInput, width: '80px'}}
                  min="1"
                  required
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={item.price}
                  onChange={(e) => updateItem(index, 'price', e.target.value)}
                  style={{...styles.modalInput, width: '100px'}}
                  step="0.01"
                  min="0"
                  required
                />
                <span style={styles.itemTotal}>
                  €{(item.quantity * item.price).toFixed(2)}
                </span>
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    style={styles.removeItemButton}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div style={styles.vatSection}>
            <div style={styles.vatControls}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.includeVat}
                  onChange={(e) => setFormData({...formData, includeVat: e.target.checked})}
                  style={styles.checkbox}
                />
                <span>Include VAT</span>
              </label>
              
              {formData.includeVat && (
                <div style={styles.vatRateGroup}>
                  <label style={styles.label}>VAT Rate (%)</label>
                  <select
                    value={formData.vatRate}
                    onChange={(e) => setFormData({...formData, vatRate: parseFloat(e.target.value)})}
                    style={{...styles.modalInput, width: '120px'}}
                  >
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="9">9%</option>
                    <option value="10">10%</option>
                    <option value="13">13%</option>
                    <option value="20">20%</option>
                    <option value="22">22%</option>
                    <option value="24">24%</option>
                    <option value="25">25%</option>
                  </select>
                  <input
                    type="number"
                    value={formData.vatRate}
                    onChange={(e) => setFormData({...formData, vatRate: parseFloat(e.target.value) || 0})}
                    style={{...styles.modalInput, width: '80px', marginLeft: '8px'}}
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="Custom"
                  />
                </div>
              )}
            </div>

            <div style={styles.totalsBreakdown}>
              <div style={styles.totalRow}>
                <span>Subtotal:</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>
              {formData.includeVat && (
                <div style={styles.totalRow}>
                  <span>VAT ({formData.vatRate}%):</span>
                  <span>€{vatAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={{...styles.totalRow, ...styles.totalRowFinal}}>
                <strong>Total:</strong>
                <strong>€{total.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              style={styles.textarea}
              rows="3"
            />
          </div>

          <div style={styles.modalActions}>
            <button type="button" onClick={onClose} style={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" style={styles.saveButton}>
              <Save size={20} />
              Save Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Additional styles for settings
const additionalStyles = {
  settingsContainer: {
    maxWidth: '800px',
    margin: '0 auto'
  },
  settingsTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '8px'
  },
  settingsSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '32px'
  },
  settingsForm: {
    background: 'white',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  formSection: {
    marginBottom: '32px',
    paddingBottom: '32px',
    borderBottom: '1px solid #e5e7eb'
  },
  settingsActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: '24px'
  },
  vatSection: {
    background: '#f9fafb',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '24px'
  },
  vatControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '16px',
    flexWrap: 'wrap'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  vatRateGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  totalsBreakdown: {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '16px'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    fontSize: '14px',
    color: '#374151'
  },
  totalRowFinal: {
    borderTop: '2px solid #111827',
    marginTop: '8px',
    paddingTop: '12px',
    fontSize: '18px',
    color: '#111827'
  }
};

// Merge additional styles
Object.assign(styles, additionalStyles);
