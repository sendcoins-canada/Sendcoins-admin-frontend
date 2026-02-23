import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailService, SendEmailPayload, SentEmailRecord } from '@/services/emailService';
import { teamService } from '@/services/teamService';
import { userService } from '@/services/userService';
import { queryKeys } from '@/lib/queryClient';
import {
  Sms,
  Refresh,
  Send2,
  DocumentText,
  Eye,
  TickCircle,
  CloseCircle,
  SearchNormal1,
  Profile2User,
  People,
} from 'iconsax-react';
import { toast } from 'sonner';
import { TableLoader } from '@/components/ui/TableLoader';
import { TableEmpty } from '@/components/ui/TableEmpty';

type RecipientFilter = 'all' | 'admin' | 'users';

interface RecipientOption {
  email: string;
  label: string;
  type: 'admin' | 'user';
}

function parseEmails(input: string): string[] {
  return input
    .split(/[\n,;]+/)
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
}

export default function Mail() {
  const queryClient = useQueryClient();
  const [toInput, setToInput] = useState('');
  const [ccInput, setCcInput] = useState('');
  const [bccInput, setBccInput] = useState('');
  const [subject, setSubject] = useState('');
  const [fromName, setFromName] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [useHtml, setUseHtml] = useState(false);
  const [page, setPage] = useState(1);
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [viewingEmail, setViewingEmail] = useState<SentEmailRecord | null>(null);

  const [recipientFilter, setRecipientFilter] = useState<RecipientFilter>('all');
  const [recipientSearch, setRecipientSearch] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<RecipientOption[]>([]);

  const { data: adminsData } = useQuery({
    queryKey: ['team', 'members', 'mail-picker', recipientFilter],
    queryFn: () => teamService.getMembers({ page: 1, limit: 100 }),
    enabled: recipientFilter === 'all' || recipientFilter === 'admin',
  });
  const { data: usersData } = useQuery({
    queryKey: ['users', 'list', 'mail-picker', recipientFilter],
    queryFn: () => userService.getUsers({ page: 1, limit: 100 }),
    enabled: recipientFilter === 'all' || recipientFilter === 'users',
  });

  const recipientOptions = useMemo((): RecipientOption[] => {
    const out: RecipientOption[] = [];
    if (recipientFilter === 'admin' || recipientFilter === 'all') {
      const admins = adminsData?.data ?? [];
      admins.forEach((a) => {
        out.push({
          email: a.email.toLowerCase(),
          label: a.fullName ? `${a.fullName} <${a.email}>` : a.email,
          type: 'admin',
        });
      });
    }
    if (recipientFilter === 'users' || recipientFilter === 'all') {
      const users = usersData?.data ?? [];
      users.forEach((u) => {
        if (out.some((r) => r.email === u.email.toLowerCase())) return;
        out.push({
          email: u.email.toLowerCase(),
          label: u.fullName ? `${u.fullName} <${u.email}>` : u.email,
          type: 'user',
        });
      });
    }
    return out;
  }, [recipientFilter, adminsData?.data, usersData?.data]);

  const filteredOptions = useMemo(() => {
    if (!recipientSearch.trim()) return recipientOptions.slice(0, 50);
    const q = recipientSearch.trim().toLowerCase();
    return recipientOptions
      .filter(
        (r) =>
          r.email.includes(q) ||
          r.label.toLowerCase().includes(q),
      )
      .slice(0, 50);
  }, [recipientOptions, recipientSearch]);

  const selectedEmails = useMemo(() => selectedRecipients.map((r) => r.email), [selectedRecipients]);

  const addRecipient = (opt: RecipientOption) => {
    if (selectedEmails.includes(opt.email)) return;
    setSelectedRecipients((prev) => [...prev, opt]);
  };

  const addAllFiltered = () => {
    const toAdd = filteredOptions.filter((opt) => !selectedEmails.includes(opt.email));
    if (toAdd.length === 0) return;
    setSelectedRecipients((prev) => [...prev, ...toAdd]);
  };

  const removeRecipient = (email: string) => {
    setSelectedRecipients((prev) => prev.filter((r) => r.email !== email));
  };

  const sendMutation = useMutation({
    mutationFn: (payload: SendEmailPayload) => emailService.send(payload),
    onSuccess: (res) => {
      if (res.sent) {
        toast.success('Email sent successfully');
        queryClient.invalidateQueries({ queryKey: queryKeys.emails.all });
        setToInput('');
        setCcInput('');
        setBccInput('');
        setSubject('');
        setBodyText('');
        setBodyHtml('');
        setSelectedRecipients([]);
      } else {
        toast.error('Email was saved but delivery may have failed. Check Zepto/SMTP config.');
        queryClient.invalidateQueries({ queryKey: queryKeys.emails.all });
      }
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to send email'),
  });

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: queryKeys.emails.list({ page, limit: 20 }),
    queryFn: () => emailService.list({ page, limit: 20 }),
  });

  const list = data?.data ?? [];
  const pagination = data?.pagination;

  const handleSend = () => {
    const manualTo = parseEmails(toInput);
    const to = [...new Set([...selectedEmails, ...manualTo])];
    if (to.length === 0) {
      toast.error('Add at least one recipient or enter an email address');
      return;
    }
    if (!subject.trim()) {
      toast.error('Enter a subject');
      return;
    }
    const payload: SendEmailPayload = {
      to: to.filter((e) => e),
      subject: subject.trim(),
      fromName: fromName.trim() || undefined,
    };
    const cc = parseEmails(ccInput);
    const bcc = parseEmails(bccInput);
    if (cc.length) payload.cc = cc;
    if (bcc.length) payload.bcc = bcc;
    if (useHtml && bodyHtml.trim()) payload.bodyHtml = bodyHtml.trim();
    else if (bodyText.trim()) payload.bodyText = bodyText.trim();
    sendMutation.mutate(payload);
  };

  const handleView = async (id: number) => {
    setViewingId(id);
    const email = await emailService.getOne(id);
    setViewingEmail(email ?? null);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <DashboardLayout title="Mail">
      {/* Compose */}
      <div className="mb-8 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
          <Sms size={20} className="text-blue-600" />
          <span className="font-medium text-gray-900">New message</span>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <label className="md:col-span-1 text-sm font-medium text-gray-600 pt-2">From name</label>
            <div className="md:col-span-2">
              <input
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                placeholder="e.g. SendCoins Support"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <label className="md:col-span-1 text-sm font-medium text-gray-600 pt-2">To</label>
            <div className="md:col-span-2 space-y-2">
              <div className="flex flex-wrap gap-2">
                <select
                  value={recipientFilter}
                  onChange={(e) => setRecipientFilter(e.target.value as RecipientFilter)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All (Admins + Users)</option>
                  <option value="admin">Admin users</option>
                  <option value="users">Normal users</option>
                </select>
                <div className="relative flex-1 min-w-[160px]">
                  <SearchNormal1 size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={recipientSearch}
                    onChange={(e) => setRecipientSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-lg p-2 bg-gray-50/50">
                {filteredOptions.length === 0 ? (
                  <p className="text-xs text-gray-500 py-2">No matches. Change filter or search.</p>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-2 py-1.5 px-2 border-b border-gray-100 mb-1">
                      <span className="text-xs text-gray-500">{filteredOptions.length} shown</span>
                      <button
                        type="button"
                        onClick={addAllFiltered}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Select all
                      </button>
                    </div>
                    <ul className="space-y-0.5">
                      {filteredOptions.map((opt) => {
                        const isSelected = selectedEmails.includes(opt.email);
                        return (
                          <li
                            key={opt.email}
                            role="button"
                            tabIndex={0}
                            onClick={() => addRecipient(opt)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                addRecipient(opt);
                              }
                            }}
                            className={`flex items-center justify-between gap-2 py-1.5 px-2 rounded cursor-pointer transition-colors ${
                              isSelected ? 'bg-blue-50 text-blue-800' : 'hover:bg-gray-100'
                            }`}
                          >
                            <span className="text-sm text-gray-700 truncate flex-1">
                              {opt.type === 'admin' ? (
                                <Profile2User size={14} className="inline text-blue-500 mr-1.5 align-middle" />
                              ) : (
                                <People size={14} className="inline text-green-500 mr-1.5 align-middle" />
                              )}
                              {opt.label}
                            </span>
                            <span
                              className={`shrink-0 text-xs font-medium ${isSelected ? 'text-blue-600' : 'text-blue-600 hover:underline'}`}
                              title={isSelected ? 'Already added' : 'Add to To'}
                            >
                              {isSelected ? 'Added' : 'Add'}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
              </div>
              {selectedRecipients.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedRecipients.map((r) => (
                    <span
                      key={r.email}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-800 rounded-full text-xs"
                    >
                      {r.label.split('<')[0].trim() || r.email}
                      <button
                        type="button"
                        onClick={() => removeRecipient(r.email)}
                        className="hover:bg-blue-100 rounded-full p-0.5"
                        aria-label="Remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <textarea
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
                placeholder="Or enter emails manually (comma or newline separated)"
                rows={1}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <label className="md:col-span-1 text-sm font-medium text-gray-500 pt-2">Cc</label>
            <div className="md:col-span-2">
              <input
                type="text"
                value={ccInput}
                onChange={(e) => setCcInput(e.target.value)}
                placeholder="Optional, comma separated"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <label className="md:col-span-1 text-sm font-medium text-gray-500 pt-2">Bcc</label>
            <div className="md:col-span-2">
              <input
                type="text"
                value={bccInput}
                onChange={(e) => setBccInput(e.target.value)}
                placeholder="Optional, comma separated"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <label className="md:col-span-1 text-sm font-medium text-gray-600 pt-2">Subject</label>
            <div className="md:col-span-2">
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="md:col-span-1 flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">Body</label>
              <label className="flex items-center gap-1.5 text-sm text-gray-500">
                <input
                  type="checkbox"
                  checked={useHtml}
                  onChange={(e) => setUseHtml(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                HTML
              </label>
            </div>
            <div className="md:col-span-2">
              {useHtml ? (
                <textarea
                  value={bodyHtml}
                  onChange={(e) => setBodyHtml(e.target.value)}
                  placeholder="HTML content (e.g. <p>Hello</p>)"
                  rows={10}
                  className="w-full px-3 py-2 text-sm font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                />
              ) : (
                <textarea
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="Plain text body"
                  rows={10}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                />
              )}
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSend}
              disabled={sendMutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {sendMutation.isPending ? (
                <>
                  <Refresh size={18} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send2 size={18} />
                  Send
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sent list */}
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DocumentText size={20} className="text-gray-600" />
            <span className="font-medium text-gray-900">Sent</span>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <Refresh size={18} className={isFetching ? 'animate-spin' : ''} />
          </button>
        </div>
        {isLoading ? (
          <TableLoader />
        ) : list.length === 0 ? (
          <TableEmpty message="No emails sent yet." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Subject</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">To</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Sent</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 w-20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50"
                    >
                      <td className="py-3 px-4 font-medium text-gray-900 max-w-xs truncate">
                        {row.subject || '(No subject)'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                        {row.toEmails.join(', ')}
                      </td>
                      <td className="py-3 px-4">
                        {row.status === 'sent' ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <TickCircle size={14} />
                            Sent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600">
                            <CloseCircle size={14} />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs">
                        {row.sentAt ? formatDate(row.sentAt) : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleView(row.id)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination && pagination.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                <span>
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page >= pagination.totalPages}
                    className="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* View modal */}
      {viewingEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="font-medium text-gray-900">Email</span>
              <button
                type="button"
                onClick={() => { setViewingId(null); setViewingEmail(null); }}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                ×
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 text-sm space-y-3">
              <p><span className="font-medium text-gray-600">From:</span> {viewingEmail.fromName || viewingEmail.fromEmail}</p>
              <p><span className="font-medium text-gray-600">To:</span> {viewingEmail.toEmails.join(', ')}</p>
              {viewingEmail.ccEmails.length > 0 && (
                <p><span className="font-medium text-gray-600">Cc:</span> {viewingEmail.ccEmails.join(', ')}</p>
              )}
              <p><span className="font-medium text-gray-600">Subject:</span> {viewingEmail.subject}</p>
              <p><span className="font-medium text-gray-600">Sent:</span> {viewingEmail.sentAt ? formatDate(viewingEmail.sentAt) : '-'}</p>
              <div className="border-t border-gray-100 pt-3 mt-3">
                {viewingEmail.bodyHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: viewingEmail.bodyHtml }} className="prose prose-sm max-w-none" />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-gray-700">{viewingEmail.bodyText || '(No body)'}</pre>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
