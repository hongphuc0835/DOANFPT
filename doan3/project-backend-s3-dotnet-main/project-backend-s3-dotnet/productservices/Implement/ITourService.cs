using productservices.DTO;
using productservices.Models;


namespace productservices.Implement
{
    public interface ITourService
    {
        Task<TourDTO> CreateTourAsync(TourDTO tourDTO);
        Task<IEnumerable<object>> GetAllToursWithRelatedDataAsync();
        Task<TourDTO> UpdateTourAsync(int id, TourDTO tourDTO);
        Task<bool> DeleteTourAsync(int id);
        Task<object> GetTourWithRelatedDataAsync(int id);
        // Task<IEnumerable<object>> SearchToursAsync(string? nameKeyword, decimal? targetPrice);


    }
}