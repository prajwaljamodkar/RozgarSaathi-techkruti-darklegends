package rozgarsaathi.model;

import org.json.JSONArray;
import org.json.JSONObject;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Represents a same-day gig posted by a household or contractor.
 * Simple POJO — swap out for a DB-backed entity later.
 */
public class Job {

    private final String id;
    private String title;
    /** Skill required: plumber, electrician, painter, carpenter, mazdoor, etc. */
    private String skillRequired;
    private String pincode;
    private String area;
    /** Work date in ISO-8601 format: yyyy-MM-dd */
    private String workDate;
    private String pay;
    private String description;
    private String posterName;
    private String posterPhone;

    public Job() {
        this.id = UUID.randomUUID().toString();
        this.workDate = LocalDate.now().toString();
    }

    // ── Getters ────────────────────────────────────────────

    public String getId()            { return id; }
    public String getTitle()         { return title; }
    public String getSkillRequired() { return skillRequired; }
    public String getPincode()       { return pincode; }
    public String getArea()          { return area; }
    public String getWorkDate()      { return workDate; }
    public String getPay()           { return pay; }
    public String getDescription()   { return description; }
    public String getPosterName()    { return posterName; }
    public String getPosterPhone()   { return posterPhone; }

    // ── Setters ────────────────────────────────────────────

    public void setTitle(String title)                 { this.title = title; }
    public void setSkillRequired(String skillRequired) {
        this.skillRequired = skillRequired == null ? null : skillRequired.toLowerCase().trim();
    }
    public void setPincode(String pincode)             { this.pincode = pincode == null ? null : pincode.trim(); }
    public void setArea(String area)                   { this.area = area; }
    public void setWorkDate(String workDate)           { this.workDate = workDate; }
    public void setPay(String pay)                     { this.pay = pay; }
    public void setDescription(String description)     { this.description = description; }
    public void setPosterName(String posterName)       { this.posterName = posterName; }
    public void setPosterPhone(String posterPhone)     { this.posterPhone = posterPhone; }

    // ── JSON helpers ───────────────────────────────────────

    /** Deserialize from a JSON request body. */
    public static Job fromJson(JSONObject j) {
        Job job = new Job();
        job.setTitle(j.optString("title", ""));
        job.setSkillRequired(j.optString("skillRequired", ""));
        job.setPincode(j.optString("pincode", ""));
        job.setArea(j.optString("area", ""));
        job.setWorkDate(j.optString("workDate", LocalDate.now().toString()));
        job.setPay(j.optString("pay", ""));
        job.setDescription(j.optString("description", ""));
        job.setPosterName(j.optString("posterName", ""));
        job.setPosterPhone(j.optString("posterPhone", ""));
        return job;
    }

    /** Serialize to JSON for HTTP responses. */
    public JSONObject toJson() {
        JSONObject o = new JSONObject();
        o.put("id", id);
        o.put("title", title);
        o.put("skillRequired", skillRequired);
        o.put("pincode", pincode);
        o.put("area", area);
        o.put("workDate", workDate);
        o.put("pay", pay);
        o.put("description", description);
        o.put("posterName", posterName);
        // Mask phone: reveal only last 4 digits in listing
        o.put("posterPhoneMasked", posterPhone != null && posterPhone.length() >= 4
                ? "XXXXXX" + posterPhone.substring(posterPhone.length() - 4) : "XXXXXXXXXX");
        return o;
    }

    /** Serialize a list of jobs to a JSON array. */
    public static JSONArray listToJson(List<Job> jobs) {
        JSONArray arr = new JSONArray();
        jobs.forEach(j -> arr.put(j.toJson()));
        return arr;
    }
}
