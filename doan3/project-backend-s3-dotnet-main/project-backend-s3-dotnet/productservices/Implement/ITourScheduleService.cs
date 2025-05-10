using productservices.DTO;
using productservices.Models;

namespace productservices.Implement
{
    public interface ITourScheduleService
    {
        Task<IEnumerable<TourSchedule>> GetAllAsync();
    Task<TourSchedule> GetByIdAsync(int id);
    Task<TourSchedule> CreateAsync(TourScheduleCreateDTO dto);
    Task<bool> UpdateAsync(int id, TourScheduleUpdateDTO dto);
    Task<bool> DeleteAsync(int id);
    }
}