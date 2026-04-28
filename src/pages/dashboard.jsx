    import { useState, useMemo, useCallback } from "react";
    import { useNavigate } from "react-router-dom";
    // import axios from "axios";
    // const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/students";

    // ── MOCK DATA (remove when backend ready) ─────────────────────────────────────
    const MOCK_STUDENTS = [
    { _id: "1", name: "Karthik S",  email: "karthik@s.com", subject: "English",          grade: "A", attendance: 78,  status: "inactive" },
    { _id: "2", name: "Meena R",   email: "meena@s.com",   subject: "History",           grade: "C", attendance: 95,  status: "active"   },
    { _id: "3", name: "Vijay T",   email: "vijay@s.com",   subject: "Math",              grade: "B", attendance: 88,  status: "active"   },
    { _id: "4", name: "Priya K",   email: "priya@s.com",   subject: "Science",           grade: "A", attendance: 92,  status: "active"   },
    { _id: "5", name: "Rahul M",   email: "rahul@s.com",   subject: "Computer Science",  grade: "B", attendance: 70,  status: "inactive" },
    ];

    const SUBJECTS = ["English", "Math", "History", "Science", "Geography", "Computer Science"];
    const GRADES   = ["A", "B", "C", "D", "F"];
    const EMPTY_FORM = { name: "", email: "", subject: "", grade: "B", attendance: 75, status: "active" };

    // ── HELPERS ───────────────────────────────────────────────────────────────────
    const attBarColor  = (v) => v >= 85 ? "#22c55e" : v >= 70 ? "#f59e0b" : "#ef4444";
    const attTextColor = (v) => v >= 85 ? "text-green-400" : v >= 70 ? "text-amber-400" : "text-red-400";

    const GRADE_STYLE = {
    A: "bg-green-500/20  text-green-300  border border-green-500/30",
    B: "bg-blue-500/20   text-blue-300   border border-blue-500/30",
    C: "bg-amber-500/20  text-amber-300  border border-amber-500/30",
    D: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
    F: "bg-red-500/20    text-red-300    border border-red-500/30",
    };

    const initials = (name) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

    const AVATAR_COLORS = [
    "from-purple-500 to-pink-500",
    "from-blue-500 to-cyan-500",
    "from-green-500 to-teal-500",
    "from-orange-500 to-amber-500",
    "from-indigo-500 to-violet-500",
    ];
    const avatarColor = (name) => 
    AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

    // ── TOAST ─────────────────────────────────────────────────────────────────────
    function Toast({ msg, type }) {
    const styles = {
        success: "bg-green-900/80 border-green-500/40 text-green-300",
        error:   "bg-red-900/80   border-red-500/40   text-red-300",
        info:    "bg-blue-900/80  border-blue-500/40  text-blue-300",
    };
    return (
        <div className={`fixed bottom-6 right-6 z-[300] flex items-center gap-2 px-5 py-3 rounded-xl border backdrop-blur text-sm font-medium shadow-2xl animate-[fadeUp_0.25s_ease] ${styles[type]}`}>
        {type === "success" && "✓"} {type === "error" && "✕"} {type === "info" && "ℹ"} {msg}
        </div>
    );
    }

    // ── STAT CARD ─────────────────────────────────────────────────────────────────
    function StatCard({ label, value, color }) {
    return (
        <div className="bg-[#13172e] border border-white/8 rounded-2xl p-5 flex flex-col gap-3 hover:border-white/15 transition-colors">
        <p className="text-[11px] tracking-[0.15em] uppercase text-gray-400 font-medium">{label}</p>
        <p className={`text-4xl font-black ${color}`}>{value}</p>
        </div>
    );
    }

    // ── MODAL FIELDs ───────────────────────────────────────────────────────────────
    function Field({ label, error, children }) {
    return (
        <div className="flex flex-col gap-1.5">
        <label className="text-[11px] uppercase tracking-widest text-gray-400 font-medium">{label}</label>
        {children}
        {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
    );
    }

    const inputCls = (err) =>
    `w-full bg-[#0f1328] border ${err ? "border-red-500" : "border-white/10"} rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition`;

    // ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
    export default function Dashboard() {
    const navigate  = useNavigate();
    const user      = JSON.parse(localStorage.getItem("user") || '{"name":"Mr. Rajan"}');

    const [students,  setStudents]  = useState( []);
    const [search,    setSearch]    = useState("");
    const [toast,     setToast]     = useState(null);
    const [modal,     setModal]     = useState(false);
    const [mode,      setMode]      = useState("add");
    const [editId,    setEditId]    = useState(null);
    const [form,      setForm]      = useState(EMPTY_FORM);
    const [errors,    setErrors]    = useState({});
    const [saving,    setSaving]    = useState(false);
    const [deleting,  setDeleting]  = useState(null);
    const [page,      setPage]      = useState(1);
    const PER_PAGE = 8;

    // ── Notify
    const notify = useCallback((msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    // ── Logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    // ── Stats
    const stats = useMemo(() => {
        const total    = students.length;
        const active   = students.filter((s) => s.status === "active").length;
        const inactive = students.filter((s) => s.status === "inactive").length;
        const avgAtt   = total ? Math.round(students.reduce((s, x) => s + x.attendance, 0) / total) : 0;
        const aGrade   = students.filter((s) => s.grade === "A").length;
        return { total, active, inactive, avgAtt, aGrade };
    }, [students]);

    // ── Filtered + paginated
    const filtered = useMemo(() => {
        if (!search.trim()) return students;
        const t = search.toLowerCase();
        return students.filter(
        (s) => s.name.toLowerCase().includes(t) || s.email.toLowerCase().includes(t) || s.subject.toLowerCase().includes(t)
        );
    }, [students, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    // ── Form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: name === "attendance" ? Number(value) : value }));
        setErrors((p) => { const n = { ...p }; delete n[name]; return n; });
    };

    const validate = (f) => {
        const e = {};
        if (!f.name.trim()) e.name = "Name is required";
        if (!f.email.trim()) e.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(f.email)) e.email = "Invalid email";
        if (!f.subject) e.subject = "Select a subject";
        const att = Number(f.attendance);
        if (isNaN(att) || att < 0 || att > 100) e.attendance = "Must be 0–100";
        return e;
    };

    const openAdd = () => {
        setForm(EMPTY_FORM); setErrors({}); setEditId(null); setMode("add"); setModal(true);
    };

    const openEdit = (s) => {
        setForm({ name: s.name, email: s.email, subject: s.subject, grade: s.grade, attendance: s.attendance, status: s.status });
        setErrors({}); setEditId(s._id); setMode("edit"); setModal(true);
    };

    const closeModal = () => { setModal(false); setErrors({}); };

    const handleSubmit = async () => {
        const e = validate(form);
        if (Object.keys(e).length) { setErrors(e); return; }
        setSaving(true);
        try {
        await new Promise((r) => setTimeout(r, 500)); // remove when backend ready

        // ── REAL BACKEND ───────────────────────────────────────────────────────
        // const token = localStorage.getItem("token");
        // const config = { headers: { Authorization: `Bearer ${token}` } };
        // if (mode === "add") {
        //   await axios.post(API_URL, form, config);
        // } else {
        //   await axios.put(`${API_URL}/${editId}`, form, config);
        // }
        // ── then call fetchStudents() instead of below ─────────────────────────

        if (mode === "add") {
            const newStudent = { ...form, _id: Date.now().toString() };
            setStudents((p) => [...p, newStudent]);
            notify("Student added successfully!");
        } else {
            setStudents((p) => p.map((s) => s._id === editId ? { ...form, _id: editId } : s));
            notify("Student updated!", "info");
        }
        closeModal();
        } catch (err) {
        notify(err.response?.data?.message || "Failed to save", "error");
        } finally {
        setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this student?")) return;
        setDeleting(id);
        try {
        await new Promise((r) => setTimeout(r, 400)); // remove when backend ready

        // ── REAL BACKEND ───────────────────────────────────────────────────────
        // const token = localStorage.getItem("token");
        // await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        // then call fetchStudents()

        setStudents((p) => p.filter((s) => s._id !== id));
        notify("Student deleted", "info");
        } catch (err) {
        notify("Failed to delete", "error");
        } finally {
        setDeleting(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0e1f] text-white">

        {/* ── TOPBAR ── */}
        <header className="sticky top-0 z-20 bg-[#0f1328]/95 backdrop-blur-md border-b border-white/8 px-6 md:px-10 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-lg shadow-md shadow-purple-500/30">
                🎓
            </div>
            <span className="font-bold text-base tracking-tight text-white">EduTrack</span>
            </div>

            <div className="flex items-center gap-4">
            <p className="text-sm text-gray-400 hidden sm:block">
                Welcome, <span className="text-purple-400 font-semibold">{user.name}</span>
            </p>
            <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:border-white/25 hover:bg-white/5 text-sm font-medium transition-all"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
            </button>
            </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 md:px-10 py-8">

            {/* ── PAGE TITLE ── */}
            <div className="mb-7">
            <h1 className="text-2xl font-black tracking-tight">Students   </h1>
            <p className="text-gray-500 text-sm mt-1">Manage all student records</p>
            </div>

            {/* ── STAT CARDS — exactly like screenshot ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total"        value={stats.total}    color="text-blue-400"   />
            <StatCard label="Active"       value={stats.active}   color="text-green-400"  />
            <StatCard label="Avg Attend."  value={`${stats.avgAtt}%`} color="text-amber-400" />
            <StatCard label="A Grade"      value={stats.aGrade}   color="text-red-400"    />
            </div>

            {/* ── SEARCH + ADD ── */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
            <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input
                type="text"
                placeholder="Search students..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="bg-[#13172e] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition w-full sm:w-64"
                />
            </div>
            <button
                onClick={openAdd}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-500/20 active:scale-95"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
                </svg>
                + Add Student
            </button>
            </div>

            {/* ── TABLE ── */}
            <div className="bg-[#13172e] border border-white/8 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full">
                <thead>
                    <tr className="border-b border-white/8">
                    {["STUDENT", "SUBJECT", "GRADE", "ATTENDANCE", "STATUS", "ACTIONS"].map((h) => (
                        <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold tracking-[0.12em] text-gray-500">{h}</th>
                    ))}
                    </tr>
                </thead>
                <tbody>
                    {paginated.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="py-16 text-center text-gray-500">
                        <div className="text-4xl mb-3">🎓</div>
                        {search ? "No students match your search." : "No students yet — add one!"}
                        </td>
                    </tr>
                    ) : paginated.map((s) => (
                    <tr key={s._id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">

                        {/* Student */}
                        <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColor(s.name)} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                            {initials(s.name)}
                            </div>
                            <div>
                            <p className="font-semibold text-sm text-white">{s.name}</p>
                            <p className="text-xs text-gray-500">{s.email}</p>
                            </div>
                        </div>
                        </td>

                        {/* Subject */}
                        <td className="px-5 py-4 text-sm text-gray-300">{s.subject}</td>

                        {/* Grade */}
                        <td className="px-5 py-4">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold ${GRADE_STYLE[s.grade] || GRADE_STYLE.F}`}>
                            {s.grade}
                        </span>
                        </td>

                        {/* Attendance */}
                        <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${s.attendance}%`, background: attBarColor(s.attendance) }}
                            />
                            </div>
                            <span className={`text-xs font-medium ${attTextColor(s.attendance)}`}>{s.attendance}%</span>
                        </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                        <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${
                            s.status === "active"
                            ? "bg-green-500/15 text-green-400 border border-green-500/25"
                            : "bg-gray-500/15 text-gray-400 border border-gray-500/25"
                        }`}>
                            {s.status}
                        </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                            <button
                            onClick={() => openEdit(s)}
                            className="p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition"
                            title="Edit"
                            >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                            </button>
                            <button
                            onClick={() => handleDelete(s._id)}
                            disabled={deleting === s._id}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-40"
                            title="Delete"
                            >
                            {deleting === s._id
                                ? <div className="w-4 h-4 border border-red-400 border-t-transparent rounded-full animate-spin" />
                                : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                            }
                            </button>
                        </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>

            {/* ── FOOTER: count + pagination ── */}
            <div className="px-5 py-3 border-t border-white/8 flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs text-gray-500">
                Showing <span className="text-gray-300 font-medium">{filtered.length}</span> of{" "}
                <span className="text-gray-300 font-medium">{students.length}</span> students
                </p>
                {totalPages > 1 && (
                <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                        page === p
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                            : "text-gray-400 hover:bg-white/10"
                        }`}
                    >
                        {p}
                    </button>
                    ))}
                </div>
                )}
            </div>
            </div>
        </main>

        {/* ── ADD / EDIT MODAL ── */}
        {modal && (
            <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
            >
            <div className="bg-[#11142a] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[95vh] overflow-y-auto animate-[fadeUp_0.2s_ease]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
                <div>
                    <h2 className="font-bold text-base text-white">
                    {mode === "add" ? "Add New Student" : "Edit Student"}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                    {mode === "add" ? "Fill in the student details below" : `Editing: ${form.name}`}
                    </p>
                </div>
                <button onClick={closeModal} className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Full Name *" error={errors.name}>
                    <input name="name" type="text" placeholder="e.g. Karthik S" value={form.name} onChange={handleChange} autoFocus className={inputCls(errors.name)} />
                    </Field>
                    <Field label="Email *" error={errors.email}>
                    <input name="email" type="email" placeholder="student@s.com" value={form.email} onChange={handleChange} className={inputCls(errors.email)} />
                    </Field>
                </div>

                <Field label="Subject *" error={errors.subject}>
                    <select name="subject" value={form.subject} onChange={handleChange} className={inputCls(errors.subject)}>
                    <option value="">— Select Subject —</option>
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </Field>

                <div className="grid grid-cols-3 gap-4">
                    <Field label="Grade">
                    <select name="grade" value={form.grade} onChange={handleChange} className={inputCls(false)}>
                        {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                    </Field>
                    <Field label="Attendance %" error={errors.attendance}>
                    <input name="attendance" type="number" min="0" max="100" value={form.attendance} onChange={handleChange} className={inputCls(errors.attendance)} />
                    </Field>
                    <Field label="Status">
                    <select name="status" value={form.status} onChange={handleChange} className={inputCls(false)}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    </Field>
                </div>

                {/* Attendance preview bar */}
                <div className="bg-[#0f1328] rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(0, Number(form.attendance)))}%`, background: attBarColor(Number(form.attendance)) }}
                    />
                    </div>
                    <span className={`text-xs font-semibold ${attTextColor(Number(form.attendance))}`}>
                    {form.attendance}% attendance
                    </span>
                </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/8 bg-[#0f1328] rounded-b-2xl">
                <button onClick={closeModal} className="px-4 py-2.5 text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/25 rounded-xl transition">
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-60 text-white rounded-xl transition"
                >
                    {saving && <div className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />}
                    {saving ? "Saving…" : mode === "add" ? "Add Student" : "Save Changes"}
                </button>
                </div>
            </div>
            </div>
        )}

        {/* ── TOAST ── */}
        {toast && <Toast msg={toast.msg} type={toast.type} />}

        <style>{`
            @keyframes fadeUp {
            from { opacity:0; transform:translateY(14px); }
            to   { opacity:1; transform:translateY(0); }
            }
        `}</style>
        </div>
    );
    }