using productservices.DTO;
using productservices.Models;
using Microsoft.EntityFrameworkCore;
using productservices.Data;
using productservices.Implement;


namespace productservices.Services
{
    public class TourScheduleService : ITourScheduleService
    {
        private readonly APIContext _context;

        public TourScheduleService(APIContext context)
        {
            _context = context;
        }


        // Lấy tất cả lịch trình và trả về DTO
        public async Task<IEnumerable<TourSchedule>> GetAllAsync()
    {
        return await _context.TourSchedules.Include(ts => ts.Tours).ToListAsync();
    }

    public async Task<TourSchedule> GetByIdAsync(int id)
    {
        return await _context.TourSchedules
            .Include(ts => ts.Tours)
            .FirstOrDefaultAsync(ts => ts.TourScheduleId == id);
    }

    public async Task<TourSchedule> CreateAsync(TourScheduleCreateDTO dto)
    {
        var tourSchedule = new TourSchedule
        {
            Name = dto.Name,
            PackagePrice = dto.PackagePrice,
            Description = dto.Description,
            TourId = dto.TourId
        };

        _context.TourSchedules.Add(tourSchedule);
        await _context.SaveChangesAsync();

        return tourSchedule;
    }

    public async Task<bool> UpdateAsync(int id, TourScheduleUpdateDTO dto)
    {
        var existingTourSchedule = await _context.TourSchedules.FindAsync(id);
        if (existingTourSchedule == null)
            return false;

        existingTourSchedule.Name = dto.Name;
        existingTourSchedule.PackagePrice = dto.PackagePrice;
        existingTourSchedule.Description = dto.Description;
        existingTourSchedule.UpdatedAt = DateTime.UtcNow;

        _context.Entry(existingTourSchedule).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var tourSchedule = await _context.TourSchedules.FindAsync(id);
        if (tourSchedule == null)
            return false;

        _context.TourSchedules.Remove(tourSchedule);
        await _context.SaveChangesAsync();

        return true;
    }
    }
}