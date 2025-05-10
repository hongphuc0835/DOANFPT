using productservices.DTO;
using productservices.Models;

namespace productservices.Implement
{
    public interface IDestinationService
    {
        Task<Destination> CreateDestinationAsync(DestinationDTO destinationDto);
        Task<DestinationWithToursDTO> GetDestinationByIdWithToursAsync(int id);
        Task<List<DestinationWithToursDTO>> GetDestinationsByNameWithToursAsync(string name);
        Task<List<DestinationWithToursDTO>> GetAllDestinationsWithToursAsync();
        Task<Destination> UpdateDestinationAsync(int id, DestinationDTO destinationDto);
        Task<bool> DeleteDestinationAsync(int id);
        
    }
}