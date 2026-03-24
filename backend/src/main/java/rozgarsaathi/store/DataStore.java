package rozgarsaathi.store;

import rozgarsaathi.model.Job;
import rozgarsaathi.model.Worker;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

/**
 * In-memory data store — thread-safe via CopyOnWriteArrayList.
 *
 * To migrate to a real database later:
 *   1. Replace the lists with JDBC / JPA calls.
 *   2. Keep the same public method signatures so handlers need no changes.
 */
public class DataStore {

    // Singleton — one store shared across all request handlers
    private static final DataStore INSTANCE = new DataStore();

    public static DataStore getInstance() { return INSTANCE; }

    private final List<Worker> workers = new CopyOnWriteArrayList<>();
    private final List<Job>    jobs    = new CopyOnWriteArrayList<>();

    private DataStore() {
        seedSampleData();
    }

    // ── Worker operations ──────────────────────────────────

    public void addWorker(Worker w) {
        workers.add(w);
    }

    /**
     * Filter workers by skill, pincode and/or availability.
     * All parameters are optional — pass null to skip that filter.
     */
    public List<Worker> findWorkers(String skill, String pincode, Boolean availableToday) {
        return workers.stream()
                .filter(w -> skill == null || skill.isBlank()
                        || skill.equalsIgnoreCase(w.getSkill()))
                .filter(w -> pincode == null || pincode.isBlank()
                        || pincode.equals(w.getPincode()))
                .filter(w -> availableToday == null
                        || w.isAvailableToday() == availableToday)
                .collect(Collectors.toList());
    }

    // ── Job operations ─────────────────────────────────────

    public void addJob(Job j) {
        jobs.add(j);
    }

    /**
     * Filter jobs by skill, pincode and/or work date.
     * All parameters are optional — pass null to skip that filter.
     */
    public List<Job> findJobs(String skill, String pincode, String date) {
        return jobs.stream()
                .filter(j -> skill == null || skill.isBlank()
                        || skill.equalsIgnoreCase(j.getSkillRequired()))
                .filter(j -> pincode == null || pincode.isBlank()
                        || pincode.equals(j.getPincode()))
                .filter(j -> date == null || date.isBlank()
                        || date.equals(j.getWorkDate()))
                .collect(Collectors.toList());
    }

    // ── Seed data ──────────────────────────────────────────

    private void seedSampleData() {
        // ── Sample workers ──
        String today = LocalDate.now().toString();

        Worker w1 = new Worker();
        w1.setName("Mohan Yadav");
        w1.setPhone("9198000001");
        w1.setSkill("plumber");
        w1.setPincode("411014");
        w1.setArea("Sion Naka, Mumbai");
        w1.setAvailableToday(true);
        w1.setVerifiedStatus("verified");
        w1.setRatePerDay(700);
        workers.add(w1);

        Worker w2 = new Worker();
        w2.setName("Suresh Kamble");
        w2.setPhone("9198000002");
        w2.setSkill("electrician");
        w2.setPincode("411014");
        w2.setArea("Dharavi, Mumbai");
        w2.setAvailableToday(true);
        w2.setVerifiedStatus("verified");
        w2.setRatePerDay(800);
        workers.add(w2);

        Worker w3 = new Worker();
        w3.setName("Raju Pawar");
        w3.setPhone("9198000003");
        w3.setSkill("painter");
        w3.setPincode("411001");
        w3.setArea("Dadar, Mumbai");
        w3.setAvailableToday(false);
        w3.setVerifiedStatus("unverified");
        w3.setRatePerDay(600);
        workers.add(w3);

        Worker w4 = new Worker();
        w4.setName("Dinesh Koli");
        w4.setPhone("9198000004");
        w4.setSkill("mazdoor");
        w4.setPincode("411014");
        w4.setArea("Kurla, Mumbai");
        w4.setAvailableToday(true);
        w4.setVerifiedStatus("pending");
        w4.setRatePerDay(500);
        workers.add(w4);

        // ── Sample jobs ──
        Job j1 = new Job();
        j1.setTitle("Bathroom tap leak repair");
        j1.setSkillRequired("plumber");
        j1.setPincode("411014");
        j1.setArea("Sion West, Mumbai");
        j1.setWorkDate(today);
        j1.setPay("₹800");
        j1.setDescription("Kitchen and bathroom taps leaking. Need fix same day.");
        j1.setPosterName("Mehta Family");
        j1.setPosterPhone("9197000001");
        jobs.add(j1);

        Job j2 = new Job();
        j2.setTitle("Wiring check — new flat");
        j2.setSkillRequired("electrician");
        j2.setPincode("411014");
        j2.setArea("Dharavi, Mumbai");
        j2.setWorkDate(today);
        j2.setPay("₹1000");
        j2.setDescription("Full electrical inspection for 2BHK flat. Bring your own tools.");
        j2.setPosterName("Reddy Builders");
        j2.setPosterPhone("9197000002");
        jobs.add(j2);

        Job j3 = new Job();
        j3.setTitle("Full room painting — 2BHK");
        j3.setSkillRequired("painter");
        j3.setPincode("411001");
        j3.setArea("Dadar, Mumbai");
        j3.setWorkDate(today);
        j3.setPay("₹600/day");
        j3.setDescription("3 rooms + kitchen. Paint provided by us. 2–3 days work.");
        j3.setPosterName("Sharma Residence");
        j3.setPosterPhone("9197000003");
        jobs.add(j3);
    }
}
