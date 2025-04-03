using System.Collections.Generic;
using System.Threading.Tasks;
using userservice.Modes;
using userservice.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace userservice.Controllers
{
    [Route("api/news")]
    [ApiController]
    public class NewsController : ControllerBase
    {
        private readonly INewsService _newsService;

        public NewsController(INewsService newsService)
        {
            _newsService = newsService;
        }

        // GET: api/News
        [HttpGet]
        public async Task<ActionResult<IEnumerable<News>>> GetAllNews()
        {
            var newsList = await _newsService.GetAllNewsAsync();
            return Ok(newsList);
        }

        // GET: api/News/5
        [HttpGet("{id}")] 
        public async Task<ActionResult<News>> GetNewsById(int id)
        {
            var news = await _newsService.GetNewsByIdAsync(id); 

            if (news == null)
                return NotFound();

            return Ok(news);
        }

        // POST: api/News
        [HttpPost]
        public async Task<ActionResult<News>> CreateNews(News news)
        {
            var createdNews = await _newsService.CreateNewsAsync(news);
            return CreatedAtAction(nameof(GetNewsById), new { id = createdNews.NewId }, createdNews);
        }

        // PUT: api/News/5
        [HttpPut("{id}")]
        public async Task<ActionResult<News>> UpdateNews(int id, News news)
        {
            var updatedNews = await _newsService.UpdateNewsAsync(id, news);

            if (updatedNews == null)
                return NotFound();

            return Ok(updatedNews);
        }

        // DELETE: api/News/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNews(int id)
        {
            var success = await _newsService.DeleteNewsAsync(id);

            if (!success)
                return NotFound();

            return NoContent();
        }
    }
}
