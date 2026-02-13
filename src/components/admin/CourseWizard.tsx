import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Check, Plus, Trash2, Edit, ChevronDown, ChevronUp, Upload, X, GripVertical } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const CATEGORIES = ["Graphics Design", "Video Editing", "Digital Marketing", "SEO", "Website Development", "Dropshipping"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const LANGUAGES = ["Bengali", "English", "Hindi"];

const STEPS = [
  { label: "Course Information", num: 1 },
  { label: "Course Media", num: 2 },
  { label: "Curriculum", num: 3 },
  { label: "Additional Information", num: 4 },
  { label: "Pricing", num: 5 },
];

interface CourseWizardProps {
  course: any | null;
  onClose: () => void;
  onSaved: () => void;
}

const generateSlug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();

const CourseWizard = ({ course, onClose, onSaved }: CourseWizardProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [slugManual, setSlugManual] = useState(false);

  // Step 1 fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [language, setLanguage] = useState("Bengali");
  const [maxStudents, setMaxStudents] = useState(0);
  const [isPublic, setIsPublic] = useState(true);
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [whatWillLearn, setWhatWillLearn] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);

  // Step 2 fields
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  // Step 3 fields
  const [topics, setTopics] = useState<string[]>([]);
  const [newTopicName, setNewTopicName] = useState("");
  const [lessons, setLessons] = useState<any[]>([]);
  const [lessonForm, setLessonForm] = useState({ title: "", video_url: "", notes: "", topic: "" });
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [openTopics, setOpenTopics] = useState<Set<string>>(new Set());

  // Step 4 fields
  const [faqs, setFaqs] = useState<any[]>([]);
  const [faqForm, setFaqForm] = useState({ question: "", answer: "", is_enabled: true });
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);

  // Step 5 fields
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState("");
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountPrice, setDiscountPrice] = useState("");
  const [expiryPeriod, setExpiryPeriod] = useState("lifetime");
  const [expiryMonths, setExpiryMonths] = useState("");
  const [instructorName, setInstructorName] = useState("");

  const isEditMode = !!course;
  const courseId = course?.id;

  // Load course data
  useEffect(() => {
    if (course) {
      setTitle(course.title || "");
      setSlug(course.slug || "");
      setCategory(course.category || "");
      setLevel(course.level || "Beginner");
      setLanguage(course.language || "Bengali");
      setMaxStudents(course.max_students || 0);
      setIsPublic(course.is_public !== false);
      setShortDescription(course.short_description || "");
      setDescription(course.description || "");
      setWhatWillLearn(Array.isArray(course.what_will_learn) ? course.what_will_learn : []);
      setRequirements(Array.isArray(course.requirements) ? course.requirements : []);
      setIsFeatured(course.is_featured || false);
      setImageUrl(course.image_url || "");
      setVideoUrl(course.video_url || "");
      setIsFree(course.is_free || false);
      setPrice(course.price?.toString() || "");
      setHasDiscount(course.has_discount || false);
      setDiscountPrice(course.discount_price?.toString() || "");
      setExpiryPeriod(course.expiry_period || "lifetime");
      setExpiryMonths(course.expiry_months?.toString() || "");
      setInstructorName(course.instructor_name || "");
      setSlugManual(true);
      fetchLessons(course.id);
      fetchFaqs(course.id);
    }
  }, [course]);

  // Auto slug
  useEffect(() => {
    if (!slugManual) setSlug(generateSlug(title));
  }, [title, slugManual]);

  const fetchLessons = async (cId: string) => {
    const { data } = await supabase.from("lessons").select("*").eq("course_id", cId).order("sort_order");
    const ls = data || [];
    setLessons(ls);
    const uniqueTopics = [...new Set(ls.map((l: any) => l.topic).filter(Boolean))] as string[];
    setTopics(uniqueTopics);
  };

  const fetchFaqs = async (cId: string) => {
    const { data } = await supabase.from("course_faqs").select("*").eq("course_id", cId).order("sort_order");
    setFaqs(data || []);
  };

  // Thumbnail upload
  const handleThumbnailUpload = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 2MB", variant: "destructive" });
      return;
    }
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast({ title: "Invalid format", description: "JPEG, PNG, GIF, WebP only", variant: "destructive" });
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("course-thumbnails").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("course-thumbnails").getPublicUrl(path);
    setImageUrl(urlData.publicUrl);
    setUploading(false);
    toast({ title: "Thumbnail uploaded!" });
  };

  // Validation
  const canNext = (s: number) => {
    if (s === 1) return title.trim() && category;
    if (s === 5 && !isFree) return !!price;
    return true;
  };

  // Save course
  const saveCourse = async () => {
    if (!title.trim() || !slug.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload: any = {
      title, slug, category: category || null, description: description || null,
      image_url: imageUrl || null, instructor_name: instructorName || null,
      price: isFree ? 0 : (price ? Number(price) : 0),
      original_price: price ? Number(price) : 0,
      level, language, max_students: maxStudents, is_public: isPublic,
      short_description: shortDescription || null,
      what_will_learn: whatWillLearn, requirements,
      is_featured: isFeatured, video_url: videoUrl || null,
      is_free: isFree, has_discount: hasDiscount,
      discount_price: hasDiscount && discountPrice ? Number(discountPrice) : null,
      expiry_period: expiryPeriod,
      expiry_months: expiryPeriod === "limited" && expiryMonths ? Number(expiryMonths) : null,
    };

    if (isEditMode) {
      const { error } = await supabase.from("courses").update(payload).eq("id", courseId);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }
      toast({ title: "Course updated!" });
    } else {
      const { error } = await supabase.from("courses").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }
      toast({ title: "Course created!" });
    }
    setSaving(false);
    onSaved();
    onClose();
  };

  // Lesson CRUD
  const saveLesson = async () => {
    if (!lessonForm.title.trim() || !courseId) return;
    if (editingLessonId) {
      await supabase.from("lessons").update({
        title: lessonForm.title, video_url: lessonForm.video_url || null,
        notes: lessonForm.notes || null, topic: lessonForm.topic || null,
      }).eq("id", editingLessonId);
    } else {
      await supabase.from("lessons").insert({
        course_id: courseId, title: lessonForm.title,
        video_url: lessonForm.video_url || null, notes: lessonForm.notes || null,
        topic: lessonForm.topic || null, sort_order: lessons.length,
      });
    }
    setLessonForm({ title: "", video_url: "", notes: "", topic: "" });
    setEditingLessonId(null);
    fetchLessons(courseId);
  };

  const deleteLesson = async (id: string) => {
    if (!courseId) return;
    await supabase.from("lessons").delete().eq("id", id);
    fetchLessons(courseId);
  };

  // FAQ CRUD
  const saveFaq = async () => {
    if (!faqForm.question.trim() || !faqForm.answer.trim() || !courseId) return;
    if (editingFaqId) {
      await supabase.from("course_faqs").update({
        question: faqForm.question, answer: faqForm.answer, is_enabled: faqForm.is_enabled,
      }).eq("id", editingFaqId);
    } else {
      await supabase.from("course_faqs").insert({
        course_id: courseId, question: faqForm.question,
        answer: faqForm.answer, is_enabled: faqForm.is_enabled, sort_order: faqs.length,
      });
    }
    setFaqForm({ question: "", answer: "", is_enabled: true });
    setEditingFaqId(null);
    fetchFaqs(courseId);
  };

  const deleteFaq = async (id: string) => {
    if (!courseId) return;
    await supabase.from("course_faqs").delete().eq("id", id);
    fetchFaqs(courseId);
  };

  // Add topic
  const addTopic = () => {
    if (!newTopicName.trim() || topics.includes(newTopicName.trim())) return;
    setTopics([...topics, newTopicName.trim()]);
    setOpenTopics(new Set([...openTopics, newTopicName.trim()]));
    setNewTopicName("");
  };

  const discountPercent = price && discountPrice && Number(price) > 0
    ? Math.round(((Number(price) - Number(discountPrice)) / Number(price)) * 100) : 0;

  // Step bar
  const renderStepBar = () => (
    <div className="flex items-center justify-between mb-8 px-2">
      {STEPS.map((s, i) => (
        <div key={s.num} className="flex items-center flex-1 last:flex-initial">
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                step > s.num
                  ? "bg-green-500 border-green-500 text-white"
                  : step === s.num
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-muted-foreground/30 text-muted-foreground"
              }`}
            >
              {step > s.num ? <Check className="h-4 w-4" /> : s.num}
            </div>
            <span className={`text-xs mt-1 text-center max-w-[80px] ${step >= s.num ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mt-[-16px] ${step > s.num ? "bg-green-500" : "bg-muted-foreground/20"}`} />
          )}
        </div>
      ))}
    </div>
  );

  // Dynamic list helper
  const DynamicList = ({ items, setItems, label }: { items: string[]; setItems: (v: string[]) => void; label: string }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <Input value={item} onChange={(e) => { const n = [...items]; n[i] = e.target.value; setItems(n); }} placeholder={`Item ${i + 1}`} />
          <Button size="icon" variant="ghost" onClick={() => setItems(items.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={() => setItems([...items, ""])}><Plus className="h-4 w-4 mr-1" />Add New Item</Button>
    </div>
  );

  return (
    <div>
      {renderStepBar()}

      {/* Step 1: Course Information */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <Label>Course Title *</Label>
            <Input value={title} onChange={(e) => { setTitle(e.target.value); if (!slugManual) setSlug(generateSlug(e.target.value)); }} placeholder="Enter course title" />
          </div>
          <div className="text-xs text-muted-foreground">Slug: {slug}</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Course Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Course Level *</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Language *</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Max Number of Students</Label>
              <Input type="number" value={maxStudents} onChange={(e) => setMaxStudents(Number(e.target.value))} placeholder="0 = unlimited" />
            </div>
          </div>
          <div>
            <Label>Public / Private Course</Label>
            <Select value={isPublic ? "public" : "private"} onValueChange={(v) => setIsPublic(v === "public")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Short Description *</Label>
            <Textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={2} />
          </div>
          <div>
            <Label>Course Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          </div>
          <DynamicList items={whatWillLearn} setItems={setWhatWillLearn} label="What will students learn in your course?" />
          <DynamicList items={requirements} setItems={setRequirements} label="Requirements" />
          <div className="flex items-center gap-3">
            <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
            <Label>Check this for featured course</Label>
          </div>
          <div>
            <Label>Instructor Name</Label>
            <Input value={instructorName} onChange={(e) => setInstructorName(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setStep(2)} disabled={!canNext(1)}>Next</Button>
          </div>
        </div>
      )}

      {/* Step 2: Course Media */}
      {step === 2 && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">Intro Course overview provider type. (.mp4, YouTube, Vimeo etc.)</p>
          <div>
            <Label>Course Thumbnail</Label>
            <div className="mt-2 border-2 border-dashed border-border rounded-xl p-6 text-center">
              {imageUrl ? (
                <div className="relative inline-block">
                  <img src={imageUrl} alt="Thumbnail" className="max-h-40 rounded-lg mx-auto" />
                  <Button size="icon" variant="ghost" className="absolute top-0 right-0" onClick={() => setImageUrl("")}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">JPEG, PNG, GIF, and WebP formats, up to 2 MB</p>
                  <label className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild><span>Upload Image</span></Button>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleThumbnailUpload(f);
                      }}
                    />
                  </label>
                </div>
              )}
              {uploading && <p className="text-sm text-primary mt-2">Uploading...</p>}
            </div>
          </div>
          <div>
            <Label>Course Video (External URL)</Label>
            <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="YouTube, Vimeo or .mp4 link" />
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>Prev</Button>
            <Button onClick={() => setStep(3)}>Next</Button>
          </div>
        </div>
      )}

      {/* Step 3: Curriculum */}
      {step === 3 && (
        <div className="space-y-4">
          {!isEditMode ? (
            <div className="bg-muted/50 rounded-xl p-6 text-center">
              <p className="text-muted-foreground">Save the course first to manage curriculum. Complete all steps and submit, then edit to add lessons.</p>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <Input value={newTopicName} onChange={(e) => setNewTopicName(e.target.value)} placeholder="Topic name" />
                <Button onClick={addTopic} disabled={!newTopicName.trim()}><Plus className="h-4 w-4 mr-1" />Add Topic</Button>
              </div>
              {topics.map((topic) => {
                const topicLessons = lessons.filter(l => l.topic === topic);
                const isOpen = openTopics.has(topic);
                return (
                  <Collapsible key={topic} open={isOpen} onOpenChange={(o) => {
                    const n = new Set(openTopics);
                    o ? n.add(topic) : n.delete(topic);
                    setOpenTopics(n);
                  }}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full bg-muted rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/80">
                      <span>{topic} ({topicLessons.length} lessons)</span>
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4 pt-2 space-y-2">
                      {topicLessons.map((l, i) => (
                        <div key={l.id} className="flex items-center justify-between bg-card border border-border rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{i + 1}. {l.title}</span>
                          </div>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => {
                              setEditingLessonId(l.id);
                              setLessonForm({ title: l.title, video_url: l.video_url || "", notes: l.notes || "", topic: l.topic || "" });
                            }}><Edit className="h-4 w-4" /></Button>
                            <Button size="icon" variant="ghost" onClick={() => deleteLesson(l.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </div>
                      ))}
                      <Button size="sm" variant="outline" onClick={() => {
                        setEditingLessonId(null);
                        setLessonForm({ title: "", video_url: "", notes: "", topic });
                      }}><Plus className="h-4 w-4 mr-1" />Add Lesson</Button>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
              {/* Ungrouped lessons */}
              {lessons.filter(l => !l.topic).length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Ungrouped Lessons</p>
                  {lessons.filter(l => !l.topic).map((l, i) => (
                    <div key={l.id} className="flex items-center justify-between bg-card border border-border rounded-lg px-3 py-2">
                      <span className="text-sm">{i + 1}. {l.title}</span>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => {
                          setEditingLessonId(l.id);
                          setLessonForm({ title: l.title, video_url: l.video_url || "", notes: l.notes || "", topic: "" });
                        }}><Edit className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteLesson(l.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Lesson form */}
              {(editingLessonId !== null || lessonForm.topic) && (
                <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-semibold">{editingLessonId ? "Edit Lesson" : "Add Lesson"}</h4>
                  <Input placeholder="Lesson title" value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} />
                  <Input placeholder="Video URL" value={lessonForm.video_url} onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })} />
                  <Textarea placeholder="Notes" value={lessonForm.notes} onChange={(e) => setLessonForm({ ...lessonForm, notes: e.target.value })} rows={2} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveLesson}>{editingLessonId ? "Update" : "Add"}</Button>
                    <Button size="sm" variant="outline" onClick={() => { setEditingLessonId(null); setLessonForm({ title: "", video_url: "", notes: "", topic: "" }); }}>Cancel</Button>
                  </div>
                </div>
              )}
            </>
          )}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>Prev</Button>
            <Button onClick={() => setStep(4)}>Next</Button>
          </div>
        </div>
      )}

      {/* Step 4: FAQs */}
      {step === 4 && (
        <div className="space-y-4">
          {!isEditMode ? (
            <div className="bg-muted/50 rounded-xl p-6 text-center">
              <p className="text-muted-foreground">Save the course first to manage FAQs.</p>
            </div>
          ) : (
            <>
              <Button size="sm" onClick={() => { setEditingFaqId(null); setFaqForm({ question: "", answer: "", is_enabled: true }); }}>
                <Plus className="h-4 w-4 mr-1" />Add FAQ
              </Button>
              {faqs.map((f) => (
                <Collapsible key={f.id}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full bg-muted rounded-xl px-4 py-3 text-sm font-medium text-foreground">
                    <span>{f.question}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${f.is_enabled ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                        {f.is_enabled ? "Enabled" : "Disabled"}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 py-3 space-y-2">
                    <p className="text-sm text-muted-foreground">{f.answer}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        setEditingFaqId(f.id);
                        setFaqForm({ question: f.question, answer: f.answer, is_enabled: f.is_enabled });
                      }}><Edit className="h-4 w-4 mr-1" />Edit</Button>
                      <Button size="sm" variant="outline" onClick={() => deleteFaq(f.id)}><Trash2 className="h-4 w-4 mr-1 text-destructive" />Delete</Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
              {(editingFaqId !== null || faqForm.question || (!editingFaqId && faqs.length === 0)) && (
                <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-semibold">{editingFaqId ? "Edit FAQ" : "Add FAQ"}</h4>
                  <div>
                    <Label>Question *</Label>
                    <Input value={faqForm.question} onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })} />
                  </div>
                  <div>
                    <Label>Answer *</Label>
                    <Textarea value={faqForm.answer} onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })} rows={3} />
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={faqForm.is_enabled} onCheckedChange={(v) => setFaqForm({ ...faqForm, is_enabled: v })} />
                    <Label>{faqForm.is_enabled ? "Enabled" : "Disabled"}</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveFaq}>{editingFaqId ? "Update" : "Add"}</Button>
                    <Button size="sm" variant="outline" onClick={() => { setEditingFaqId(null); setFaqForm({ question: "", answer: "", is_enabled: true }); }}>Cancel</Button>
                  </div>
                </div>
              )}
            </>
          )}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)}>Prev</Button>
            <Button onClick={() => setStep(5)}>Next</Button>
          </div>
        </div>
      )}

      {/* Step 5: Pricing */}
      {step === 5 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Checkbox checked={isFree} onCheckedChange={(v) => setIsFree(!!v)} />
            <Label>Check if this is a free course</Label>
          </div>
          {!isFree && (
            <>
              <div>
                <Label>Course Price (৳)</Label>
                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Enter price" />
              </div>
              <div className="flex items-center gap-3">
                <Checkbox checked={hasDiscount} onCheckedChange={(v) => setHasDiscount(!!v)} />
                <Label>Check if this course has discount</Label>
              </div>
              {hasDiscount && (
                <div>
                  <Label>Discount Price (৳)</Label>
                  <Input type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} placeholder="Enter discount price" />
                  <p className="text-sm text-primary mt-1">This course has {discountPercent}% Discount</p>
                </div>
              )}
            </>
          )}
          <div className="border-t border-border pt-4">
            <Label className="mb-2 block">Expiry Period</Label>
            <RadioGroup value={expiryPeriod} onValueChange={setExpiryPeriod} className="flex gap-4">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="lifetime" id="lifetime" />
                <Label htmlFor="lifetime">Lifetime</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="limited" id="limited" />
                <Label htmlFor="limited">Limited Time</Label>
              </div>
            </RadioGroup>
            {expiryPeriod === "limited" && (
              <div className="mt-3">
                <Label>Number of months</Label>
                <Input type="number" value={expiryMonths} onChange={(e) => setExpiryMonths(e.target.value)} placeholder="e.g. 6" className="w-40" />
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">After purchase, students can access the course until your selected time.</p>
          </div>
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep(4)}>Prev</Button>
            <Button onClick={saveCourse} disabled={saving || !canNext(5)}>
              {saving ? "Saving..." : isEditMode ? "Update Course" : "Submit Course"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseWizard;
