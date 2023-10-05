const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const fs = require('fs');

class StreamsController {

    // Convert mp3 to m3u8
    convertFile(req, res) {

        console.log(req.file, req.body.name)

        const outputDirectory = `src/temp/chunks/${req.query.fileName}`; 
        const outputM3U8FileName = 'playlist.m3u8';

        const outputPath = `${outputDirectory}/${outputM3U8FileName}`;
        console.log(outputPath);

        // Tạo thư mục đầu ra nếu nó chưa tồn tại
        if (!fs.existsSync(outputDirectory)) {
            fs.mkdirSync(outputDirectory);
        }

        // using ffmpeg to convert file mp3 to m3u8
        ffmpeg()
        .input(req.file.path)
        .inputFormat('mp3')
        .outputOptions('-hls_time 10')
        .outputOptions('-hls_list_size 0')
        .output(outputPath)
        .on('end', () => {
            console.log('Chuyển đổi hoàn tất.');

            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.error('Lỗi khi xóa file MP3:', err);
                } else {
                    console.log('File MP3 đã được xóa thành công.');
                }
        });

            res.status(200).json({ 
                message: 'Chuyển đổi hoàn tất' ,
                fileLink: `http://localhost:3000/etravel/live/hls/${req.query.fileName}/playlist.m3u8`
            });
        })
        .on('error', (err) => {
            console.error('Lỗi khi chuyển đổi:', err);
            res.status(500).json({ 
                error: 'Lỗi khi chuyển đổi.' 
            });
        })
        .run();
    }

    HlsStreaming(req, res) {
        console.log('request starting...');
        
        const folder = req.params.folder; // Lấy giá trị tham số động cho folder
        const filename = req.params.filename; // Lấy giá trị tham số động cho filename
        const filePath = `src/temp/chunks/${folder}/${filename}`;

        console.log(filePath);

        fs.readFile(filePath, function(error, content) {
            res.writeHead(200, { 'Access-Control-Allow-Origin': '*' });
            if (error) {
                if(error.code == 'ENOENT'){
                    fs.readFile('./404.html', function(error, content) {
                        res.end(content, 'utf-8');
                    });
                }
                else {
                    res.writeHead(500);
                    res.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
                    res.end(); 
                }
            }
            else {
                res.end(content, 'utf-8');
            }
        });
    }

    RemoveFile(req, res) {
        const directoryPath = `src/temp/chunks/${req.query.fileName}`;
        console.log(directoryPath);

        if (fs.existsSync(directoryPath)) {
            try {
              fs.rmdirSync(directoryPath, { recursive: true });
              console.log(`Thư mục ${directoryPath} đã được xóa.`);

              res.status(200).json({ 
                message: 'xóa file hoàn tất'
            });
            } catch (err) {
              console.error(`Lỗi khi xóa thư mục: ${err}`);

              res.status(500).json({ 
                error: `Lỗi khi xóa thư mục: ${err}` 
            });
            }
          } else {
            console.log(`Thư mục ${directoryPath} không tồn tại.`);

            res.status(400).json({ 
                error: `Thư mục ${directoryPath} không tồn tại.` 
            });
          }
    }
}
module.exports = new StreamsController;