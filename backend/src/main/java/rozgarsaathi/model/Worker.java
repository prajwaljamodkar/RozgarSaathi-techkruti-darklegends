package rozgarsaathi.model;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.List;
import java.util.UUID;

/**
 * Represents a daily-wage worker who registers on RozgarSaathi.
 * Simple POJO — swap out for a DB-backed entity later.
 */
public class Worker {

    private final String id;
    private String name;
    private String phone;
    /** Primary skill: plumber, electrician, painter, carpenter, mazdoor, etc. */
    private String skill;
    private String pincode;
    /** true = available today */
    private boolean availableToday;
    /** unverified | pending | verified */
    private String verifiedStatus;
    private int ratePerDay;
    private String area;

    public Worker() {
        this.id = UUID.randomUUID().toString();
        this.verifiedStatus = "unverified";
    }

    // ── Getters ────────────────────────────────────────────

    public String getId()             { return id; }
    public String getName()           { return name; }
    public String getPhone()          { return phone; }
    public String getSkill()          { return skill; }
    public String getPincode()        { return pincode; }
    public boolean isAvailableToday() { return availableToday; }
    public String getVerifiedStatus() { return verifiedStatus; }
    public int getRatePerDay()        { return ratePerDay; }
    public String getArea()           { return area; }

    // ── Setters ────────────────────────────────────────────

    public void setName(String name)                     { this.name = name; }
    public void setPhone(String phone)                   { this.phone = phone; }
    public void setSkill(String skill)                   { this.skill = skill == null ? null : skill.toLowerCase().trim(); }
    public void setPincode(String pincode)               { this.pincode = pincode == null ? null : pincode.trim(); }
    public void setAvailableToday(boolean availableToday){ this.availableToday = availableToday; }
    public void setVerifiedStatus(String verifiedStatus) { this.verifiedStatus = verifiedStatus; }
    public void setRatePerDay(int ratePerDay)            { this.ratePerDay = ratePerDay; }
    public void setArea(String area)                     { this.area = area; }

    // ── JSON helpers ───────────────────────────────────────

    /** Deserialize from a JSON request body. */
    public static Worker fromJson(JSONObject j) {
        Worker w = new Worker();
        w.setName(j.optString("name", ""));
        w.setPhone(j.optString("phone", ""));
        w.setSkill(j.optString("skill", ""));
        w.setPincode(j.optString("pincode", ""));
        w.setAvailableToday(j.optBoolean("availableToday", false));
        w.setRatePerDay(j.optInt("ratePerDay", 0));
        w.setArea(j.optString("area", ""));
        if (j.has("verifiedStatus")) {
            w.setVerifiedStatus(j.optString("verifiedStatus", "unverified"));
        }
        return w;
    }

    /** Serialize to JSON for HTTP responses. Phone is masked until contact flow. */
    public JSONObject toJson() {
        JSONObject o = new JSONObject();
        o.put("id", id);
        o.put("name", name);
        // Show only last 4 digits for privacy; full phone returned only via /contact
        o.put("phoneMasked", phone != null && phone.length() >= 4
                ? "XXXXXX" + phone.substring(phone.length() - 4) : "XXXXXXXXXX");
        o.put("skill", skill);
        o.put("pincode", pincode);
        o.put("area", area);
        o.put("availableToday", availableToday);
        o.put("verifiedStatus", verifiedStatus);
        o.put("ratePerDay", ratePerDay);
        return o;
    }

    /** toJson variant that includes the real phone (used in contact endpoint). */
    public JSONObject toJsonWithPhone() {
        JSONObject o = toJson();
        o.put("phone", phone);
        return o;
    }

    /** Serialize a list of workers to a JSON array. */
    public static JSONArray listToJson(List<Worker> workers) {
        JSONArray arr = new JSONArray();
        workers.forEach(w -> arr.put(w.toJson()));
        return arr;
    }
}
