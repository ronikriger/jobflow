"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    ExternalLink,
    MapPin,
    DollarSign,
    Calendar,
    Clock,
    Plus,
    Phone,
    Mail,
    Linkedin,
    User,
    MessageSquare,
    FileText,
    CheckCircle2,
    Circle,
    MoreHorizontal,
    Trash2,
    Edit2,
    X,
    Ghost,
} from "lucide-react";
import {
    useApplication,
    updateApplication,
    updateApplicationStatus,
    deleteApplication,
    addEvent,
    addContact,
    markFollowUpSent,
} from "@/lib/hooks";
import {
    cn,
    formatDate,
    formatRelativeDate,
    getDaysInStage,
    getDaysSinceLastTouch,
    getCompanyLogo,
    getStatusColorClass,
} from "@/lib/utils";
import { STATUS_CONFIG, PLATFORM_CONFIG } from "@/lib/types";
import type { ApplicationStatus, EventType, ApplicationEvent } from "@/lib/types";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function ApplicationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = parseInt(params.id as string);

    const { application, events, contacts } = useApplication(id);
    const [imageError, setImageError] = useState(false);
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const [showAddEvent, setShowAddEvent] = useState(false);
    const [showAddContact, setShowAddContact] = useState(false);
    const [notes, setNotes] = useState("");
    const [editingNotes, setEditingNotes] = useState(false);

    if (!application) {
        return (
            <div className="min-h-screen p-8 flex items-center justify-center">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        );
    }

    const daysInStage = getDaysInStage(application);
    const daysSinceTouch = getDaysSinceLastTouch(application);
    const platformConfig = PLATFORM_CONFIG[application.platform];

    const handleStatusChange = async (newStatus: ApplicationStatus) => {
        await updateApplicationStatus(id, newStatus);
        setShowStatusMenu(false);
    };

    const handleDelete = async () => {
        if (confirm(`Delete application for ${application.company}?`)) {
            await deleteApplication(id);
            router.push("/board");
        }
    };

    const handleSaveNotes = async () => {
        await updateApplication(id, { notes });
        setEditingNotes(false);
    };

    const sortedEvents = events
        ?.slice()
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="min-h-screen p-8">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-4xl mx-auto space-y-8"
            >
                {/* Back button */}
                <motion.div variants={itemVariants}>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                </motion.div>

                {/* Header Card */}
                <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                        {/* Company Logo */}
                        <div className="relative w-16 h-16 rounded-xl bg-secondary overflow-hidden flex-shrink-0">
                            {!imageError ? (
                                <Image
                                    src={getCompanyLogo(application.company)}
                                    alt={application.company}
                                    fill
                                    className="object-cover"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                                    {application.company.charAt(0)}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold">{application.company}</h1>
                                    <p className="text-lg text-muted-foreground">{application.role}</p>
                                </div>

                                {/* Status dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowStatusMenu(!showStatusMenu)}
                                        className={cn(
                                            "px-4 py-2 rounded-xl font-medium border transition-colors",
                                            getStatusColorClass(application.status)
                                        )}
                                    >
                                        {STATUS_CONFIG[application.status].label}
                                    </button>

                                    {showStatusMenu && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setShowStatusMenu(false)}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="absolute right-0 top-12 w-48 bg-card border border-border rounded-xl shadow-xl z-20 overflow-hidden"
                                            >
                                                {(Object.keys(STATUS_CONFIG) as ApplicationStatus[]).map(
                                                    (status) => (
                                                        <button
                                                            key={status}
                                                            onClick={() => handleStatusChange(status)}
                                                            className={cn(
                                                                "w-full px-4 py-2.5 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2",
                                                                application.status === status && "bg-secondary"
                                                            )}
                                                        >
                                                            <span
                                                                className={cn(
                                                                    "w-2 h-2 rounded-full",
                                                                    status === "saved" && "bg-indigo-500",
                                                                    status === "applied" && "bg-blue-500",
                                                                    status === "screen" && "bg-violet-500",
                                                                    status === "interview1" && "bg-amber-500",
                                                                    status === "interview2" && "bg-orange-500",
                                                                    status === "final" && "bg-pink-500",
                                                                    status === "offer" && "bg-emerald-500",
                                                                    status === "rejected" && "bg-red-500",
                                                                    status === "ghosted" && "bg-gray-500"
                                                                )}
                                                            />
                                                            {STATUS_CONFIG[status].label}
                                                        </button>
                                                    )
                                                )}
                                            </motion.div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Meta info */}
                            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                                {application.location && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {application.location}
                                    </span>
                                )}
                                {application.salary && (
                                    <span className="flex items-center gap-1">
                                        <DollarSign className="w-4 h-4" />
                                        {application.salary}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Applied {application.appliedAt ? formatDate(application.appliedAt) : "Not yet"}
                                </span>
                                {application.url && (
                                    <a
                                        href={application.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-primary hover:underline"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        View posting
                                    </a>
                                )}
                            </div>

                            {/* Stats row */}
                            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
                                <div>
                                    <p className="text-xs text-muted-foreground">Days in stage</p>
                                    <p className={cn(
                                        "font-semibold",
                                        daysInStage > 7 && "text-amber-400"
                                    )}>
                                        {daysInStage}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Last touch</p>
                                    <p className={cn(
                                        "font-semibold",
                                        daysSinceTouch > 7 && "text-amber-400"
                                    )}>
                                        {formatRelativeDate(application.lastTouchAt)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Platform</p>
                                    <p className="font-semibold">{platformConfig.label}</p>
                                </div>

                                <div className="ml-auto flex items-center gap-2">
                                    <button
                                        onClick={() => markFollowUpSent(id)}
                                        className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-sm font-medium transition-colors"
                                    >
                                        Log Follow-up
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Timeline */}
                    <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Timeline</h2>
                            <button
                                onClick={() => setShowAddEvent(true)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Event
                            </button>
                        </div>

                        <div className="glass-card rounded-xl p-4">
                            {sortedEvents && sortedEvents.length > 0 ? (
                                <div className="space-y-4">
                                    {sortedEvents.map((event, index) => (
                                        <TimelineEvent
                                            key={event.id}
                                            event={event}
                                            isLast={index === sortedEvents.length - 1}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">
                                    No events yet. Add your first event to track progress.
                                </p>
                            )}
                        </div>
                    </motion.div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Notes */}
                        <motion.div variants={itemVariants} className="glass-card rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">Notes</h3>
                                {!editingNotes && (
                                    <button
                                        onClick={() => {
                                            setNotes(application.notes || "");
                                            setEditingNotes(true);
                                        }}
                                        className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                )}
                            </div>

                            {editingNotes ? (
                                <div className="space-y-2">
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={4}
                                        className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:border-primary outline-none resize-none text-sm"
                                        placeholder="Add notes about this application..."
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingNotes(false)}
                                            className="flex-1 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-sm transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveNotes}
                                            className="flex-1 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm transition-colors"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    {application.notes || "No notes yet."}
                                </p>
                            )}
                        </motion.div>

                        {/* Contacts */}
                        <motion.div variants={itemVariants} className="glass-card rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">Contacts</h3>
                                <button
                                    onClick={() => setShowAddContact(true)}
                                    className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                                >
                                    <Plus className="w-4 h-4 text-muted-foreground" />
                                </button>
                            </div>

                            {contacts && contacts.length > 0 ? (
                                <div className="space-y-3">
                                    {contacts.map((contact) => (
                                        <div
                                            key={contact.id}
                                            className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                                                <User className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm">{contact.name}</p>
                                                {contact.role && (
                                                    <p className="text-xs text-muted-foreground">{contact.role}</p>
                                                )}
                                                <div className="flex items-center gap-2 mt-1">
                                                    {contact.email && (
                                                        <a
                                                            href={`mailto:${contact.email}`}
                                                            className="text-muted-foreground hover:text-foreground"
                                                        >
                                                            <Mail className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                    {contact.linkedin && (
                                                        <a
                                                            href={contact.linkedin}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-muted-foreground hover:text-foreground"
                                                        >
                                                            <Linkedin className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No contacts yet.</p>
                            )}
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div variants={itemVariants} className="glass-card rounded-xl p-4 space-y-3">
                            <h3 className="font-semibold">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => handleStatusChange("offer")}
                                    className="flex items-center justify-center gap-2 p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-sm font-medium transition-colors"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Offer
                                </button>
                                <button
                                    onClick={() => handleStatusChange("rejected")}
                                    className="flex items-center justify-center gap-2 p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-medium transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    Rejected
                                </button>
                                <button
                                    onClick={() => handleStatusChange("ghosted")}
                                    className="flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-500/10 text-gray-400 hover:bg-gray-500/20 text-sm font-medium transition-colors col-span-2"
                                >
                                    <Ghost className="w-4 h-4" />
                                    Mark as Ghosted
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Add Event Modal */}
            <AddEventModal
                open={showAddEvent}
                onClose={() => setShowAddEvent(false)}
                applicationId={id}
            />

            {/* Add Contact Modal */}
            <AddContactModal
                open={showAddContact}
                onClose={() => setShowAddContact(false)}
                applicationId={id}
            />
        </div>
    );
}

function TimelineEvent({ event, isLast }: { event: ApplicationEvent; isLast: boolean }) {
    const iconMap: Record<EventType, React.ElementType> = {
        applied: FileText,
        "phone-screen": Phone,
        technical: MessageSquare,
        "take-home": FileText,
        onsite: Calendar,
        offer: CheckCircle2,
        rejection: X,
        "follow-up": Mail,
        note: MessageSquare,
        "status-change": Circle,
    };

    const Icon = iconMap[event.type] || Circle;

    return (
        <div className="flex gap-3">
            <div className="flex flex-col items-center">
                <div
                    className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        event.completed ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                    )}
                >
                    <Icon className="w-4 h-4" />
                </div>
                {!isLast && <div className="w-px flex-1 bg-border my-1" />}
            </div>
            <div className="flex-1 pb-4">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="font-medium text-sm">{event.title}</p>
                        {event.description && (
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {event.description}
                            </p>
                        )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {formatRelativeDate(event.date)}
                    </span>
                </div>
            </div>
        </div>
    );
}

function AddEventModal({
    open,
    onClose,
    applicationId,
}: {
    open: boolean;
    onClose: () => void;
    applicationId: number;
}) {
    const [type, setType] = useState<EventType>("note");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;

        await addEvent({
            applicationId,
            type,
            title,
            description: description || undefined,
            date: new Date(),
            completed: true,
        });

        setType("note");
        setTitle("");
        setDescription("");
        onClose();
    };

    if (!open) return null;

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-2xl p-6 z-50"
            >
                <h3 className="text-lg font-semibold mb-4">Add Event</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Event Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as EventType)}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border focus:border-primary outline-none"
                        >
                            <option value="phone-screen">Phone Screen</option>
                            <option value="technical">Technical Interview</option>
                            <option value="take-home">Take Home</option>
                            <option value="onsite">Onsite</option>
                            <option value="follow-up">Follow-up</option>
                            <option value="note">Note</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border focus:border-primary outline-none"
                            placeholder="e.g., Phone screen with recruiter"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Description (optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border focus:border-primary outline-none resize-none"
                            placeholder="Additional details..."
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 rounded-lg bg-secondary hover:bg-secondary/80 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-medium transition-colors"
                        >
                            Add Event
                        </button>
                    </div>
                </form>
            </motion.div>
        </>
    );
}

function AddContactModal({
    open,
    onClose,
    applicationId,
}: {
    open: boolean;
    onClose: () => void;
    applicationId: number;
}) {
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [email, setEmail] = useState("");
    const [linkedin, setLinkedin] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;

        await addContact({
            applicationId,
            name,
            role: role || undefined,
            email: email || undefined,
            linkedin: linkedin || undefined,
        });

        setName("");
        setRole("");
        setEmail("");
        setLinkedin("");
        onClose();
    };

    if (!open) return null;

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-2xl p-6 z-50"
            >
                <h3 className="text-lg font-semibold mb-4">Add Contact</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border focus:border-primary outline-none"
                            placeholder="e.g., Sarah Chen"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Role (optional)</label>
                        <input
                            type="text"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border focus:border-primary outline-none"
                            placeholder="e.g., Technical Recruiter"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Email (optional)</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border focus:border-primary outline-none"
                            placeholder="sarah@company.com"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">LinkedIn (optional)</label>
                        <input
                            type="url"
                            value={linkedin}
                            onChange={(e) => setLinkedin(e.target.value)}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border focus:border-primary outline-none"
                            placeholder="https://linkedin.com/in/..."
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 rounded-lg bg-secondary hover:bg-secondary/80 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-medium transition-colors"
                        >
                            Add Contact
                        </button>
                    </div>
                </form>
            </motion.div>
        </>
    );
}

