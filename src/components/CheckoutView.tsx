import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Banknote,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Sparkles,
  ShoppingBag,
  FileText,
  AlertTriangle,
  Upload,
  Clock,
  XCircle,
  Check,
  Zap,
  RefreshCw,
  Plus,
  Info,
} from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { api } from '../services/api.js';
import { Order, Prescription } from '../types.js';

interface CheckoutViewProps {
  onBackToShopping: () => void;
  onOrderPlaced: (order: Order) => void;
}

export function CheckoutView({ onBackToShopping, onOrderPlaced }: CheckoutViewProps) {
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [shippingDetails, setShippingDetails] = useState({
    name: user?.name || 'Aarav Sharma',
    phone: '9876543210',
    address: 'Room 402, Block B, Campus Residence Hostel',
    city: 'Bengaluru',
    pincode: '560001',
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'simulated_card'>('simulated_card');
  const [submitting, setSubmitting] = useState(false);

  // Prescription state
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string>('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadingPrescription, setUploadingPrescription] = useState(false);
  const [quickVerifying, setQuickVerifying] = useState(false);

  // New Prescription Form state
  const [uploadForm, setUploadForm] = useState({
    patientName: user?.name || 'Aarav Sharma',
    doctorName: 'Dr. Priya Deshmukh, M.D.',
    hospitalOrClinic: 'Apollo Health Center & Clinic, Indiranagar',
    prescriptionDate: new Date().toISOString().split('T')[0],
    notes: 'Prescribed for acute symptom management. Valid for 30 days.',
    fileName: 'prescription_dr_deshmukh.pdf',
    fileSize: '1.4 MB',
    fileUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
  });

  // Check if cart contains prescription items
  const prescriptionItems = cart.items.filter(item => item.requiresPrescription);
  const hasPrescriptionItems = prescriptionItems.length > 0;

  const loadPrescriptions = async () => {
    try {
      setLoadingPrescriptions(true);
      const res = await api.prescriptions.getAll();
      setPrescriptions(res.prescriptions);

      // Auto select first approved prescription if available, or first uploaded
      if (res.prescriptions.length > 0 && !selectedPrescriptionId) {
        const approved = res.prescriptions.find(p => p.status === 'approved');
        if (approved) {
          setSelectedPrescriptionId(approved.id);
        } else {
          setSelectedPrescriptionId(res.prescriptions[0].id);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const selectedPrescription = prescriptions.find(p => p.id === selectedPrescriptionId);

  // Handle uploading a prescription
  const handleUploadPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.patientName || !uploadForm.doctorName || !uploadForm.prescriptionDate) {
      showToast('error', 'Missing Information', 'Please fill in patient name, doctor, and date');
      return;
    }

    try {
      setUploadingPrescription(true);
      const res = await api.prescriptions.upload({
        patientName: uploadForm.patientName,
        doctorName: uploadForm.doctorName,
        hospitalOrClinic: uploadForm.hospitalOrClinic,
        prescriptionDate: uploadForm.prescriptionDate,
        notes: uploadForm.notes,
        fileName: uploadForm.fileName,
        fileSize: uploadForm.fileSize,
        fileUrl: uploadForm.fileUrl,
      });

      showToast('success', 'Prescription Uploaded', 'Submitted for pharmacist verification');
      setShowUploadForm(false);
      await loadPrescriptions();
      setSelectedPrescriptionId(res.prescription.id);
    } catch (err: any) {
      showToast('error', 'Upload failed', err.message);
    } finally {
      setUploadingPrescription(false);
    }
  };

  // Demo helper: quick pharmacist approval for testing
  const handleSimulatePharmacistApproval = async (prescriptionId: string) => {
    try {
      setQuickVerifying(true);
      const res = await api.prescriptions.verify(prescriptionId, {
        status: 'approved',
        verifiedBy: 'Pharmacist R. Verma, Reg #DL-74921',
      });
      showToast('success', 'Prescription Approved', 'Pharmacist verification completed successfully.');
      await loadPrescriptions();
      setSelectedPrescriptionId(res.prescription.id);
    } catch (err: any) {
      showToast('error', 'Verification failed', err.message);
    } finally {
      setQuickVerifying(false);
    }
  };

  // Determine if checkout is blocked
  let checkoutBlocked = false;
  let blockedReason = '';

  if (hasPrescriptionItems) {
    if (!selectedPrescriptionId || !selectedPrescription) {
      checkoutBlocked = true;
      blockedReason = 'Please select or upload a valid prescription for regulated Rx items.';
    } else if (selectedPrescription.status === 'pending') {
      checkoutBlocked = true;
      blockedReason = 'Prescription is currently under pharmacist verification. Approval is mandatory before checkout.';
    } else if (selectedPrescription.status === 'rejected') {
      checkoutBlocked = true;
      blockedReason = `Prescription rejected: "${selectedPrescription.rejectionReason || 'Invalid document'}". Please upload a valid prescription.`;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (checkoutBlocked) {
      showToast('error', 'Checkout Blocked', blockedReason);
      return;
    }

    if (!shippingDetails.name || !shippingDetails.phone || !shippingDetails.address || !shippingDetails.city || !shippingDetails.pincode) {
      showToast('error', 'Incomplete Details', 'Please fill in all shipping fields');
      return;
    }

    try {
      setSubmitting(true);
      const addressPayload = {
        fullName: shippingDetails.name,
        phone: shippingDetails.phone,
        email: user?.email || 'customer@medibasket.com',
        streetAddress: shippingDetails.address,
        city: shippingDetails.city,
        pincode: shippingDetails.pincode,
      };

      const res = await api.orders.create({
        address: addressPayload,
        paymentMethod: paymentMethod === 'cod' ? 'cod' : 'online_simulated',
        prescriptionId: hasPrescriptionItems ? selectedPrescriptionId : undefined,
      });

      await refreshCart();
      showToast('success', 'Order Confirmed!', `Order #${res.order.id} placed successfully.`);
      onOrderPlaced(res.order);
    } catch (err: any) {
      showToast('error', 'Checkout failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="checkout-view-container" className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <button
          onClick={onBackToShopping}
          className="text-xs font-semibold text-slate-600 hover:text-teal-700 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shopping</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Lock className="w-3.5 h-3.5 text-teal-600" />
          <span>Encrypted Simulated Checkout</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Shipping, Prescription (if needed) & Payment */}
        <div className="lg:col-span-7 space-y-6">

          {/* Section 1: Delivery Address */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs flex items-center justify-center font-bold">1</span>
              <span>Delivery Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  id="checkout-name"
                  type="text"
                  required
                  value={shippingDetails.name}
                  onChange={e => setShippingDetails({ ...shippingDetails, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Phone *</label>
                <input
                  id="checkout-phone"
                  type="tel"
                  required
                  value={shippingDetails.phone}
                  onChange={e => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">PIN Code *</label>
                <input
                  id="checkout-pincode"
                  type="text"
                  required
                  value={shippingDetails.pincode}
                  onChange={e => setShippingDetails({ ...shippingDetails, pincode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Street / Hostel / Dorm Address *</label>
                <textarea
                  id="checkout-address"
                  required
                  rows={2}
                  value={shippingDetails.address}
                  onChange={e => setShippingDetails({ ...shippingDetails, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">City & State *</label>
                <input
                  id="checkout-city"
                  type="text"
                  required
                  value={shippingDetails.city}
                  onChange={e => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Prescription Verification (ONLY SHOWN IF CART CONTAINS Rx ITEMS) */}
          {hasPrescriptionItems ? (
            <div id="rx-verification-section" className="bg-white p-6 rounded-2xl border-2 border-amber-400/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-600" />
                    Doctor's Prescription Verification
                  </span>
                </h3>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                  Mandatory for {prescriptionItems.length} Rx Item(s)
                </span>
              </div>

              {/* Rx Items in this order */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
                <div className="text-xs font-bold text-amber-950 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Regulated Medicines In Your Cart:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {prescriptionItems.map(item => (
                    <span key={item.id} className="text-[11px] bg-white text-amber-900 font-semibold px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      {item.name} (Qty: {item.quantity})
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-amber-800/90 pt-1">
                  In compliance with Drugs & Cosmetics regulations, prescription medicines cannot be dispatched without pharmacist verification of a valid doctor's prescription.
                </p>
              </div>

              {/* Prescription Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Select Uploaded Prescription:
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUploadForm(!showUploadForm)}
                    className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showUploadForm ? 'Cancel Upload' : 'Upload New Prescription'}</span>
                  </button>
                </div>

                {loadingPrescriptions ? (
                  <div className="text-xs text-slate-400 py-3 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Loading prescriptions...</span>
                  </div>
                ) : prescriptions.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 text-center">
                    <FileText className="w-8 h-8 text-amber-500 mx-auto mb-1.5" />
                    <div className="text-xs font-bold text-slate-800">No Prescriptions on File</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Please upload your doctor's prescription below to proceed.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {prescriptions.map(p => {
                      const isSelected = selectedPrescriptionId === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedPrescriptionId(p.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-teal-600 bg-teal-50/40 ring-2 ring-teal-600/20'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5">
                              <input
                                type="radio"
                                name="selectedPrescription"
                                checked={isSelected}
                                onChange={() => setSelectedPrescriptionId(p.id)}
                                className="mt-1 accent-teal-600"
                              />
                              <div>
                                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                  <span>{p.doctorName}</span>
                                  <span className="text-[10px] text-slate-400 font-normal">({p.hospitalOrClinic || 'Clinic'})</span>
                                </div>
                                <div className="text-[11px] text-slate-600 mt-0.5">
                                  Patient: <strong className="text-slate-800">{p.patientName}</strong> • Date: {p.prescriptionDate}
                                </div>
                                {p.notes && (
                                  <div className="text-[10px] text-slate-500 mt-0.5 italic">"{p.notes}"</div>
                                )}
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div>
                              {p.status === 'approved' && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shrink-0">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Approved & Verified</span>
                                </span>
                              )}
                              {p.status === 'pending' && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 shrink-0">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>Pending Review</span>
                                </span>
                              )}
                              {p.status === 'rejected' && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 shrink-0">
                                  <XCircle className="w-3 h-3 text-rose-600" />
                                  <span>Rejected</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Rejection notice if rejected */}
                          {p.status === 'rejected' && p.rejectionReason && (
                            <div className="mt-2 text-[11px] text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
                              <strong>Rejection Remark:</strong> {p.rejectionReason}
                            </div>
                          )}

                          {/* Quick Pharmacist demo verification trigger */}
                          {p.status === 'pending' && (
                            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[10px] text-slate-500">Pharmacist review usually takes 15-30 mins</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSimulatePharmacistApproval(p.id);
                                }}
                                disabled={quickVerifying}
                                className="text-[11px] font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-md border border-teal-200 flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Zap className="w-3 h-3" />
                                <span>{quickVerifying ? 'Verifying...' : '⚡ Instant Verify (Demo Approval)'}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Upload New Prescription Sub-form */}
                {showUploadForm && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 mt-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-teal-600" />
                        Upload Doctor's Prescription
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowUploadForm(false)}
                        className="text-[11px] text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-0.5">Patient Name *</label>
                        <input
                          type="text"
                          required
                          value={uploadForm.patientName}
                          onChange={e => setUploadForm({ ...uploadForm, patientName: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-0.5">Doctor Name & Qualifications *</label>
                        <input
                          type="text"
                          required
                          value={uploadForm.doctorName}
                          onChange={e => setUploadForm({ ...uploadForm, doctorName: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-0.5">Hospital / Clinic *</label>
                        <input
                          type="text"
                          required
                          value={uploadForm.hospitalOrClinic}
                          onChange={e => setUploadForm({ ...uploadForm, hospitalOrClinic: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-0.5">Prescription Date *</label>
                        <input
                          type="date"
                          required
                          value={uploadForm.prescriptionDate}
                          onChange={e => setUploadForm({ ...uploadForm, prescriptionDate: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block font-semibold text-slate-700 mb-0.5">Doctor's Notes / Dosage Instructions</label>
                        <input
                          type="text"
                          value={uploadForm.notes}
                          onChange={e => setUploadForm({ ...uploadForm, notes: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block font-semibold text-slate-700 mb-1">Prescription Document / Photo *</label>
                        <div className="p-3 border-2 border-dashed border-teal-300 bg-white rounded-xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 text-xs text-slate-700">
                            <FileText className="w-6 h-6 text-teal-600 shrink-0" />
                            <div>
                              <span className="font-bold block">{uploadForm.fileName}</span>
                              <span className="text-[10px] text-slate-400">PDF / JPG • {uploadForm.fileSize} • Valid Stamp & Signature</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded border border-teal-200">
                            Attached
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleUploadPrescription}
                      disabled={uploadingPrescription}
                      className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingPrescription ? 'Uploading & Digitizing...' : 'Submit Prescription for Verification'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Status Warning Callout if Blocked */}
              {checkoutBlocked && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-2 animate-in fade-in">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Checkout Restricted:</span>
                    <span className="text-[11px] leading-relaxed">{blockedReason}</span>
                  </div>
                </div>
              )}

              {/* Success Callout if Approved */}
              {selectedPrescription?.status === 'approved' && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">Prescription Verified:</span> Active approval by certified pharmacist ({selectedPrescription.verifiedBy || 'Pharmacy Staff'}). Checkout authorized.
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Direct OTC confirmation */
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <div className="text-xs text-emerald-950">
                <span className="font-bold block">Direct OTC Essentials Order</span>
                <span className="text-[11px] text-emerald-800">Your basket contains only non-prescription emergency essentials. No doctor's prescription is required.</span>
              </div>
            </div>
          )}

          {/* Section 3: Payment Method */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs flex items-center justify-center font-bold">
                {hasPrescriptionItems ? '3' : '2'}
              </span>
              <span>Payment Option</span>
            </h3>

            <div className="space-y-2.5">
              <label
                id="payment-simulated-card"
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'simulated_card'
                    ? 'border-teal-500 bg-teal-50/60 ring-2 ring-teal-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'simulated_card'}
                    onChange={() => setPaymentMethod('simulated_card')}
                    className="accent-teal-600"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-teal-600" />
                      <span>Simulated Instant Online Payment (Demo)</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Immediate demo authorization • No actual charge applied
                    </div>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">FAST</span>
              </label>

              <label
                id="payment-cod"
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-teal-500 bg-teal-50/60 ring-2 ring-teal-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-teal-600"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Banknote className="w-4 h-4 text-slate-600" />
                      <span>Cash on Delivery (COD)</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Pay cash or UPI upon package doorstep arrival
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary & Checkout Action */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 sticky top-24">
            <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-semibold text-slate-500">({cart.itemCount} Items)</span>
            </h3>

            {/* Items review */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {cart.items.map(item => (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={item.image} alt={item.name} className="w-9 h-9 rounded-lg object-cover border border-slate-100" />
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate max-w-[150px] flex items-center gap-1">
                        <span>{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span>Qty: {item.quantity}</span>
                        {item.requiresPrescription && (
                          <span className="font-bold text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                            Rx
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-slate-800">₹{item.price * item.quantity}</div>
                </div>
              ))}
            </div>

            {/* Prescription Compliance Tag in Summary */}
            {hasPrescriptionItems && (
              <div className="pt-2 border-t border-slate-100 text-[11px]">
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-600 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-amber-600" /> Rx Status:
                  </span>
                  {selectedPrescription?.status === 'approved' ? (
                    <span className="font-bold text-emerald-700">✓ Verified</span>
                  ) : selectedPrescription?.status === 'pending' ? (
                    <span className="font-bold text-amber-600">⏳ Pending Verification</span>
                  ) : selectedPrescription?.status === 'rejected' ? (
                    <span className="font-bold text-rose-600">❌ Rejected</span>
                  ) : (
                    <span className="font-bold text-slate-400">Not Provided</span>
                  )}
                </div>
              </div>
            )}

            {/* Price Calculations */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">₹{cart.subtotal}</span>
              </div>

              {cart.bundleDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Kit Bundle Savings
                  </span>
                  <span>-₹{cart.bundleDiscount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{cart.deliveryFee === 0 ? <strong className="text-teal-700">FREE</strong> : `₹${cart.deliveryFee}`}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-extrabold text-slate-900">
                <span>Final Amount:</span>
                <span className="text-teal-700">₹{cart.finalTotal}</span>
              </div>
            </div>

            {/* Place Order CTA - Disabled & Blocked if Prescription is missing/pending/rejected */}
            <div>
              <button
                id="place-order-btn"
                type="submit"
                disabled={submitting || cart.items.length === 0 || checkoutBlocked}
                className={`w-full py-3.5 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                  checkoutBlocked
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300 shadow-none'
                    : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20'
                }`}
              >
                {checkoutBlocked ? (
                  <>
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span>
                      {!selectedPrescriptionId
                        ? 'Prescription Upload Required'
                        : selectedPrescription?.status === 'pending'
                        ? 'Prescription Pending Approval'
                        : 'Prescription Rejected'}
                    </span>
                  </>
                ) : submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Confirming Order...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Place Order • ₹{cart.finalTotal}</span>
                  </>
                )}
              </button>

              {checkoutBlocked && (
                <div className="text-center text-[10px] text-rose-600 font-semibold mt-2">
                  ⚠️ Complete prescription verification above to unlock checkout
                </div>
              )}
            </div>

            <div className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Certified sterile emergency supplies dispatched within 2 hours</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
