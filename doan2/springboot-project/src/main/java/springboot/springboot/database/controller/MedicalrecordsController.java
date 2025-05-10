package springboot.springboot.database.controller;

import org.modelmapper.ModelMapper;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import springboot.springboot.database.entity.*;
import springboot.springboot.database.model.EntityToJSON;
import springboot.springboot.database.model.ModelBuid;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.sql.SQLException;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/medicalrecords")
public class MedicalrecordsController<T extends Entity<?>> {

    @Autowired
    private ModelBuid model;
    private EntityToJSON json = new EntityToJSON();

    @PostMapping("/insert")
    public void insert(@RequestBody Map<String, Object> requestData) throws SQLException, IllegalAccessException, InstantiationException {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.addConverter(new StringToDateConverter());
        Medicalrecords medicalrecords = modelMapper.map(requestData, Medicalrecords.class);
        model.insert(medicalrecords);
    }

    @PutMapping("/update")
    public void update(@RequestBody Map<String, Object> requestData) throws SQLException, IllegalAccessException {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.addConverter(new StringToDateConverter());
        Medicalrecords medicalrecords = modelMapper.map(requestData, Medicalrecords.class);
        model.update(medicalrecords);
    }

    @DeleteMapping("/delete")
    public String delete(@RequestBody Map<String, Object> requestData) throws SQLException, IllegalAccessException {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.addConverter(new StringToDateConverter());
        Medicalrecords medicalrecord = modelMapper.map(requestData, Medicalrecords.class);
        System.out.println(medicalrecord.toString());
        // Kiểm tra xem ID có null hay không
        if (medicalrecord.getRecord_id() == null) {
            throw new IllegalArgumentException("ID value cannot be null");
        }

        // In ra log để kiểm tra ID
        System.out.println("Deleting record with ID: " + medicalrecord.getRecord_id());

        model.delete(medicalrecord);
        return "success";
    }



    @GetMapping("/list")
    public List<T> list() throws SQLException, IllegalAccessException, NoSuchMethodException, InstantiationException, InvocationTargetException {
        return model.getAll(new Medicalrecords().getClass());
    }

    @GetMapping("/search")
    public List<Medicalrecords> getByField(@RequestParam Map<String, String> requestParams) {
        try {
            List<Medicalrecords> medicalrecordsList = new ArrayList<>();
            ModelMapper modelMapper = new ModelMapper();
            modelMapper.addConverter(new StringToDateConverter());

            Medicalrecords medicalrecords1 = modelMapper.map(requestParams, Medicalrecords.class);
            List<Medicalrecords> medicalrecords = model.getEntityById(medicalrecords1);

            for (Medicalrecords record : medicalrecords) {
                Medicalrecords newRecord = new Medicalrecords();
                BeanUtils.copyProperties(record, newRecord);

                Patients patientsFilter = new Patients();
                patientsFilter.setPatient_id(record.getPatient_id());
                List<Patients> patientsList = model.getEntityById(patientsFilter);
                newRecord.setPatients(patientsList);

                Doctors doctorsFilter = new Doctors();
                doctorsFilter.setDoctor_id(record.getDoctor_id());
                List<Doctors> doctorsList = model.getEntityById(doctorsFilter);
                newRecord.setDoctors(doctorsList);

                medicalrecordsList.add(newRecord);
            }


            return medicalrecordsList;
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public static List<String> getChildClassFieldNames(Class<?> parentClass) {
        List<String> childFieldNames = new ArrayList<>();

        Field[] fields = parentClass.getDeclaredFields();

        for (Field field : fields) {
            Class<?> fieldClass = field.getType();
            if (fieldClass != null && !fieldClass.isPrimitive() && fieldClass != String.class && !parentClass.isAssignableFrom(fieldClass) && fieldClass != Date.class) {
                childFieldNames.add(field.getName());
            }
        }
        return childFieldNames;
    }
    @GetMapping("/fields")
    public ResponseEntity<List<String>> getMedicalRecordFields() {
        Field[] fields = Medicalrecords.class.getDeclaredFields();
        List<String> fieldNames = Arrays.stream(fields)
                .map(Field::getName)
                .collect(Collectors.toList());
        return ResponseEntity.ok(fieldNames);
    }
    @GetMapping("/doctor/{doctorId}")
    public List<Medicalrecords> getByDoctorId(@PathVariable int doctorId) {
        try {
            Medicalrecords filter = new Medicalrecords();
            filter.setDoctor_id(doctorId);
            List<Medicalrecords> records = model.getEntityById(filter);

            for (Medicalrecords record : records) {
                Patients patientsFilter = new Patients();
                patientsFilter.setPatient_id(record.getPatient_id());
                List<Patients> patientsList = model.getEntityById(patientsFilter);
                record.setPatients(patientsList);

                Doctors doctorsFilter = new Doctors();
                doctorsFilter.setDoctor_id(record.getDoctor_id());
                List<Doctors> doctorsList = model.getEntityById(doctorsFilter);
                record.setDoctors(doctorsList);
            }

            return records;
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

}
